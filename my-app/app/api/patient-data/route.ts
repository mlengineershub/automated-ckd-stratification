import { NextResponse } from 'next/server'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patientId')

  if (!patientId) {
    return NextResponse.json(
      { error: 'Patient ID is required' },
      { status: 400 }
    )
  }

  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'cleaned_data.csv')
    
    if (!existsSync(csvPath)) {
      return NextResponse.json(
        { error: 'Data file not found' },
        { status: 404 }
      )
    }

    const csvData = readFileSync(csvPath, 'utf-8')
    const rows = csvData.split('\n')
    
    const patientEntries = rows
      .map(row => {
        const [patient, entryDate, eGFR, uACR, risk] = row.split(',')
        
        if (patient === patientId) {
          return {
            date: entryDate,
            eGFR: eGFR ? parseFloat(eGFR) : null,
            uACR: uACR ? parseFloat(uACR) : null,
            riskValue: risk ? parseInt(risk) : null
          }
        }
        return null
      })
      .filter(entry => entry !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json(patientEntries)
  } catch (error) {
    console.error('Error reading CSV:', error)
    return NextResponse.json(
      { error: 'Failed to process data' },
      { status: 500 }
    )
  }
}
