import { NextRequest, NextResponse } from 'next/server';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';

type Context = {
  params: {
    path: string[]
  }
}

export async function GET(
  request: NextRequest,
  context: Context
): Promise<Response> {
  try {
    const filePath = join(process.cwd(), 'temp', ...context.params.path);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stats = await stat(filePath);
    const stream = createReadStream(filePath);

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${context.params.path[context.params.path.length - 1]}"`,
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 