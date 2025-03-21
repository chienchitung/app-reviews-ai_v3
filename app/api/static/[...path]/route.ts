import { NextRequest, NextResponse } from 'next/server';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { stat } from 'fs/promises';

type Props = {
  params: {
    path: string[]
  }
}

export async function GET(
  request: NextRequest,
  props: Props
) {
  try {
    const filePath = join(process.cwd(), 'temp', ...props.params.path);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stats = await stat(filePath);
    const stream = createReadStream(filePath);

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${props.params.path[props.params.path.length - 1]}"`,
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 