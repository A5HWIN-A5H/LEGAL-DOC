import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { writeFile, unlink } from 'fs/promises';

export async function POST(req: NextRequest) {
  let tmpPath: string | null = null;
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}.pdf`);
    await writeFile(tmpPath, buffer);
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'extract_pdf.py');
    
    const result = await new Promise<string>((resolve, reject) => {
      let stdoutData = '';
      let stderrData = '';
      
      const child = spawn('python3', [scriptPath, tmpPath!]);
      
      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });
      
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderrData || `Process exited with code ${code}`));
        } else {
          resolve(stdoutData);
        }
      });
      
      child.on('error', (err) => {
        reject(err);
      });
    });
    
    return NextResponse.json({ text: result });
  } catch (err: any) {
    console.error('PDF extraction failed:', err);
    return NextResponse.json({ error: 'Failed to extract text from PDF: ' + err.message }, { status: 500 });
  } finally {
    if (tmpPath) {
      await unlink(tmpPath).catch(console.error);
    }
  }
}
