Guia de Inicialização do Projeto - Tela de Login
Este guia descreve o processo para clonar, configurar e executar o projeto Tela de Login a partir do repositório do GitHub.


1. Clonando o Repositório
Execute o seguinte comando no terminal para clonar o repositório do projeto:

git clone https://github.com/DouglasReis07/Tela-login/

Isso criará uma cópia local do repositório na sua máquina.


2. Alternando para a Branch v1.0
Após clonar o repositório, navegue até a pasta do projeto e altere para a branch v1.0 com o comando:

git switch v1.0


3. Atualizando o Repositório
Garanta que o repositório local está atualizado com as últimas alterações do remoto utilizando:

git pull

Isso sincroniza o repositório local com o servidor remoto.


4. Navegando para o Diretório do Projeto
Entre no diretório raiz do projeto com:

cd projeto


5. Instalando Dependências
Instale todas as dependências necessárias para o funcionamento do projeto utilizando o comando:

npm install

Esse comando verificará o arquivo package.json e instalará as bibliotecas e pacotes necessários.


6. Iniciando o Projeto
Após a instalação, inicie o projeto com:

npm start

O comando iniciará o servidor de desenvolvimento e abrirá o projeto no navegador padrão.


Resumo dos Comandos
git clone https://github.com/DouglasReis07/Tela-login/
git switch v1.0
git pull
cd projeto
npm install
npm start


Requisitos

Node.js: Certifique-se de que o Node.js (versão recomendada: LTS) está instalado na sua máquina.


NPM: O gerenciador de pacotes do Node.js deve estar configurado corretamente.



Observações

Se houver problemas ao executar o comando npm start, verifique:


Erros nas dependências instaladas.


A versão do Node.js e do NPM.


Se as portas do servidor local (geralmente http://localhost:3000) estão livres.