import sqlite3
import pandas as pd
import numpy as np

def calculate_egfr(creatinine, sex, age):
    creatinine = creatinine / 88.4  # Conversion µmol/L -> mg/dL
    
    if sex == "F":
        if creatinine <= 0.7:
            egfr = 144 * (creatinine / 0.7) ** -0.329 * (0.993 ** age)
        else:
            egfr = 144 * (creatinine / 0.7) ** -1.209 * (0.993 ** age)
    else:  # Male
        if creatinine <= 0.9:
            egfr = 141 * (creatinine / 0.9) ** -0.411 * (0.993 ** age)
        else:
            egfr = 141 * (creatinine / 0.9) ** -1.209 * (0.993 ** age)
    
    return egfr

def classify_ckd_risk(egfr, uacr):
    # Déterminer la catégorie eGFR (G1 à G5)
    if egfr >= 90:
        gfr_category = "G1"
    elif 60 <= egfr < 90:
        gfr_category = "G2"
    elif 45 <= egfr < 60:
        gfr_category = "G3a"
    elif 30 <= egfr < 45:
        gfr_category = "G3b"
    elif 15 <= egfr < 30:
        gfr_category = "G4"
    else:
        gfr_category = "G5"

    # Déterminer la catégorie UACR (A1 à A3)
    if uacr < 3:
        acr_category = "A1"
    elif 3 <= uacr < 30:
        acr_category = "A2"
    else:
        acr_category = "A3"

    # Déterminer le risque selon la matrice CKD
    risk_matrix = {
        ("G1", "A1"): 1, ("G1", "A2"): 2, ("G1", "A3"): 3,
        ("G2", "A1"): 1, ("G2", "A2"): 2, ("G2", "A3"): 3,
        ("G3a", "A1"): 2, ("G3a", "A2"): 3, ("G3a", "A3"): 4,
        ("G3b", "A1"): 3, ("G3b", "A2"): 4, ("G3b", "A3"): 4,
        ("G4", "A1"): 4, ("G4", "A2"): 4, ("G4", "A3"): 4,
        ("G5", "A1"): 4, ("G5", "A2"): 4, ("G5", "A3"): 4,
    }

    return risk_matrix.get((gfr_category, acr_category), np.nan)

def extract_transform_load(input_path, output_path):
    
    # Connexion à la base de données SQLite (lecture)
    conn = sqlite3.connect(input_path)

    # Charger les tables dans des DataFrames
    query_labs = "SELECT Patient, EntryDate, Analyte, ValueNumber, ValueText, Unit FROM labs"
    query_patients = "SELECT Patient, Sex FROM patients"

    df_labs = pd.read_sql_query(query_labs, conn)
    df_patients = pd.read_sql_query(query_patients, conn)

    # Fermeture de la connexion SQLite
    conn.close()

    # Convertir les dates au format datetime et trier
    df_labs["EntryDate"] = pd.to_datetime(df_labs["EntryDate"]).dt.date
    df_labs = df_labs.sort_values(by=["Patient", "EntryDate"])

    # Initialiser les structures pour stocker les dernières valeurs
    latest_egfr = {}
    latest_uacr = {}
    output_data = []

    # Fusionner avec les sexes des patients
    df_labs = df_labs.merge(df_patients, on="Patient", how="left")

    # Itérer sur chaque ligne
    for _, row in df_labs.iterrows():
        patient_id = row["Patient"]
        entry_date = row["EntryDate"]
        analyte = row["Analyte"]
        value_number = row["ValueNumber"]
        value_text = row["ValueText"]
        sex = row["Sex"]

        # Hypothèse : âge moyen de 50 ans en l'absence de données
        age = 50

        # Initialiser les valeurs
        egfr, uacr = np.nan, np.nan

        # Si l'analyse concerne la créatinine sérique
        if analyte == "s_kreatinin" and pd.notna(value_number):
            egfr = calculate_egfr(value_number, sex, age)
            latest_egfr[patient_id] = egfr

        # Si l'analyse concerne l'UACR
        elif analyte == "UACR":
            if pd.notna(value_number):
                uacr = value_number * 1000  # Convertir g/mol → mg/g
            else:
                uacr = np.nan
            latest_uacr[patient_id] = uacr

        # Obtenir les valeurs les plus récentes si absentes
        egfr = latest_egfr.get(patient_id, np.nan) if pd.isna(egfr) else egfr
        uacr = latest_uacr.get(patient_id, np.nan) if pd.isna(uacr) else uacr

        # Calculer le risque CKD
        risk = classify_ckd_risk(egfr, uacr)

        # Ajouter à la liste de résultats
        output_data.append([patient_id, entry_date, egfr, uacr, risk])

    # Créer le DataFrame final
    df_output = pd.DataFrame(output_data, columns=["Patient", "EntryDate", "eGFR", "UACR", "Risk"])

    # Écrire dans la base SQLite (écrase la table existante)
    conn_out = sqlite3.connect(output_path)
    df_output.to_sql("ckd_processed", conn_out, if_exists="replace", index=False)
    conn_out.close()

    print(f"Transformation done {output_path}")

# Exemple d'utilisation
extract_transform_load("data/CKD_train.db", "data/ckd_post.db")