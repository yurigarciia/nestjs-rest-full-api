import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';

@Injectable()
export class FileService {
  upload(file: Express.Multer.File, path: string) {
    // ALTERAR LÓGICA PARA SUBIR EM BUCKET, NO FUTURO
    return writeFile(path, file.buffer);
  }

  // EXEMPLO DE CÓDIGO PARAR RECEBER MULTIPLOS ARQUIVOS EM CAMPOS DIFERENTES (ÚTIL PARA LIVROS E CAPAS)
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'photo', maxCount: 1 },
  //     { name: 'documents', maxCount: 10 },
  //   ]),
  // )
  // @UseGuards(AuthGuard)
  // @Post('files-fields')
  // async uploadFilesFields(
  //   @User() user,
  //   @UploadedFiles()
  //   files: { photo: Express.Multer.File[]; documents: Express.Multer.File[] },
  // ) {
  //   return files;
  // }
}
