from setuptools import setup, find_packages

setup(
    name='Automated-CKD-Stratification',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    author='ML Engineers Hub',
    install_requires=[
        'numpy',
        'pandas',
        'matplotlib',
        'tqdm',
        'seaborn',
        'uvicorn',
        'fastapi'
    ],
    python_requires='>=3.11',
)