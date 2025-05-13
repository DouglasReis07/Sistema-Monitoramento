# Passo 1: Instalar o Node.js e npm
    Baixar e Instalar o Node.js:

    Acesse o site oficial do Node.js: Node.js Official Website

    Baixe a versão recomendada para a maioria dos usuários (LTS).

    Siga as instruções do instalador para o seu sistema operacional.

    Verificar Instalação:
    Após a instalação, abra o PowerShell ou terminal e execute os comandos abaixo para verificar se o Node.js e o npm foram instalados corretamente:

    node -v
    npm -v


# Passo 2: Clonar o Repositório
    Clone o repositório do seu projeto React do GitHub para o seu computador:

    Clone o Repositório:
    No PowerShell ou terminal, execute o comando:

    git clone https://github.com/DouglasReis07/Tela-login.git
    cd Tela-login


# Passo 3: Instalar as Dependências do Projeto
    Agora, instale todas as dependências do projeto React que estão listadas no arquivo package.json:

    Instalar Dependências:

    Execute o comando:

    npm install


# Passo 4: Desbloquear Execução de Scripts no PowerShell
    Para permitir que o PowerShell execute scripts, você precisará alterar a política de execução.

    Abrir PowerShell como Administrador:

    Clique com o botão direito no ícone do PowerShell e selecione Executar como Administrador.

    Desbloquear Execução de Scripts:
    Execute o seguinte comando para permitir a execução de scripts:

    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

    Este comando permite a execução de scripts locais não assinados, mas exige que os scripts baixados da internet sejam assinados.

    Quando solicitado, digite "S" para confirmar.

# Passo 5: Rodar o Projeto
    Agora que todas as dependências estão instaladas e a política de execução de scripts foi ajustada, você pode rodar o seu projeto React:

    Iniciar o Servidor de Desenvolvimento:

    Execute o seguinte comando:

    npm start

    O servidor de desenvolvimento será iniciado, e você pode acessar o projeto no navegador no seu endereço.

#  Desenvolvedores:

•  Front-End desenvolvido por Douglas Reis e Gustavo Meira.
  
•  Back-End desenvolvido por Gerson Moreira.

# Direitos Autorais:

⚠️ Aviso de Direitos Autorais
Este projeto é fechado e protegido por direitos autorais.

Não é permitido copiar, redistribuir, modificar, comercializar ou publicar este projeto, no todo ou em parte.

Não é autorizado alegar autoria ou coautoria sem permissão expressa do autor.

Qualquer uso não autorizado poderá resultar em medidas legais.

Este projeto não está licenciado para uso público nem comercial.


Se quiser, posso salvar esse conteúdo em um arquivo `README.md` e te enviar ou te ajudar a colocá-lo no seu repositório do GitHub. Deseja isso?
Você disse:
me de ele completo que vou copiar e colar  la
O ChatGPT disse:
Claro, Douglas! Aqui está o conteúdo completo do README.md pronto para você copiar e colar no seu repositório:

# Tela de Login - React

## Passo 1: Instalar Node.js e npm

- Baixe e instale o Node.js do site oficial: [https://nodejs.org/](https://nodejs.org/)
- Verifique se a instalação foi concluída com sucesso executando os comandos abaixo no PowerShell ou terminal:

```bash
node -v
npm -v
Passo 2: Clonar o Repositório
Clone este repositório para sua máquina local:

git clone https://github.com/DouglasReis07/Tela-login.git
cd Tela-login
Passo 3: Instalar Dependências
Instale todas as dependências necessárias para rodar o projeto:

npm install
Passo 4: Desbloquear Execução de Scripts no PowerShell
Abra o PowerShell como Administrador e execute o comando abaixo para permitir a execução de scripts locais:

Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
Digite "S" quando solicitado para confirmar.

Passo 5: Rodar o Projeto
Após instalar as dependências e ajustar a política de execução, rode o servidor de desenvolvimento com:

npm start
O projeto estará disponível no seu navegador, normalmente em: http://localhost:3000.

Passo 6: Desenvolvedores

• Front-End: Douglas Reis e Gustavo Meira

• Back-End: Gerson Moreira

⚠️ Aviso de Direitos Autorais
Este projeto é fechado e protegido por direitos autorais.

Não é permitido copiar, redistribuir, modificar, comercializar ou publicar este projeto, no todo ou em parte.

Não é autorizado alegar autoria ou coautoria sem permissão expressa do autor.

Qualquer uso não autorizado poderá resultar em medidas legais.

Este projeto não está licenciado para uso público nem comercial.
