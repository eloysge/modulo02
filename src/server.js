/**
 * Dependencias instaladas:
 * yarn add express
 *
 * yarn add sucrase -D
 * yarn add nodemon -D
 *
 *
 */
import app from './app';

app.listen(3333);

/**
 * Instalando ferramentas de padronização do código.
 *
 * yarn add eslint -D
 * yarn eslint --init
 * selecione:
 * 1-"To check syntax, find problems, and enforce code style"
 * 2-"JavaScript modules (import/export)"
 * 3-"None of these"
 * 3-"Desmarcar () Browse, selecione apenas (*)Node"
 * 4-"Use a popular style guide: Airbnb"
 * 5-"JavaScript"
 * Install with npm(Y)
 * (configurações do .eslintrc.js)
 * (configurações do settings.json do vs-code)
 *
 * Instalando prettier:
 * yarn add prettier eslint-config-prettier eslint-plugin-prettier -D
 * (configurações do ".eslintrc.js")
 * (configurações do "settings.json" do vs-code)
 * (configurações do prettier em ".prettierrc")
 *
 * obs: se for preciso passar o eslint em todos os arquivos js, sem ter
 * que entrar em cada um e salvar, execute:
 * yarn eslint --fix src --ext .js
 *
 * Configuração do editorconfig. (já instalado como extensão do vs-code)
 * clique com o botão direito na pasta rais dos fontes (src)
 * selecione: Generete ".editorconfig"
 * (passe os dois ultimos parâmetros para "true")
 *
 * Instação do "sequelize"
 * yarn add sequelize
 * yarn add sequelize-cli -D
 *
 * Para o banco "postgres"
 * duas dependencias:
 * yarn add pg pg-hstore
 *
 * timezone do database: (GMT -03)
 * ALTER DATABASE postgres SET timezone TO 'Brazil/East';
 *
 * Configuração do ".sequelizerc"
 *
 * Criação das pastas que o sequelize vai usar
 *
 * Para gerar o hash da senha de usuário:
 * yarn add bcryptjs
 *
 * AUTENTICAÇÃO usando JWT (json web token)
 * instalando dependencias:
 * yarn add jsonwebtoken
 *
 * VALIDAÇÃO de dados do Database
 * instalando dependencia:
 * yarn add yup
 *
 * IMPLEMENTAÇÃO DO UPLOAD DE ARQUIVOS
 * instalando dependencia:
 * yarn add multer
 *
 * TRATAMENTO DE DATAS
 * instalando dependencia:
 * yarn add date-fns@next
 *
 */
