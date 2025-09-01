<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Repositório Backend base para aplicações server-side escaláveis e eficientes.</p>
    <p align="center">
</p>

## Descrição

Repositório de um Backend feito em [Nest](https://github.com/nestjs/nest) com TS, base para qualquer aplicação backend, com CRUD completo de auth e usuários (adm-side), conta com módulos prontos de envio de emails, upload de arquivos, conexão com banco de dados e sistema de segurança baseado em papéis.

## Setup do Projeto
O projeto está configurado para rodar com um Banco de Dados MySQL local, cuja conexão consta na .env.example, para executar o projeto é necessário conecta-lo a um banco de dados e prepará-lo.

```bash
$ npm install
```
Após usar o npm install, indique a conexão com seu banco MySQL e execute o seguinte comando para preparar o banco de dados:
```bash
$ npm run migrate:up
```


## Compilação & Execução do projeto

```bash
# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run prod
```

## Contatos

- Autor - [Yuri Garcia](https://www.linkedin.com/in/ogarciia/)
- Linkedin - [ogarciia](https://www.linkedin.com/in/ogarciia/)
- Instagram - [@yuri.garciia](https://www.instagram.com/yuri.garciia?igsh=bmtiN2dlbG02cDNv)