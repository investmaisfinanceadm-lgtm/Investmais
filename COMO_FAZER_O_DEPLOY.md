# Guia Passo a Passo: Colocando o Investmais no Ar com Easypanel

Olá! Este é um guia feito especialmente para você, escrito da forma mais simples possível. Não se preocupe se você se considera leigo, vamos fazer isso juntos, passo a passo.

O código do seu projeto já está **100% preparado** para rodar no Easypanel. Eu criei dois arquivos para ajudar o servidor a entender o seu projeto: um `Dockerfile` e um `next.config.js` ajustado.

Siga os passos abaixo, com calma:

---

## Passo 1: Salve o código na sua conta do GitHub

O Easypanel não pega os arquivos direto do seu computador. Ele pega lá do GitHub. Então o primeiro passo é enviar essas mudanças que eu acabei de fazer para o seu GitHub.

1. Abra o **Terminal** do seu VSCode (ou onde você roda os comandos do projeto).
2. Digite esse comando e aperte **Enter**:
   ```bash
   git add .
   ```
3. Agora digite esse comando e aperte **Enter**:
   ```bash
   git commit -m "Preparando o projeto para o Easypanel"
   ```
4. E por fim, envie para o GitHub com esse comando e aperte **Enter**:
   ```bash
   git push origin main
   ```
   *(Se a sua branch principal tiver outro nome, como `master`, troque a palavra `main` por `master`)*.

Pronto! Seu código atualizado já está na internet, no seu GitHub.

---

## Passo 2: Acessando e criando o projeto no Easypanel

1. Abra o seu navegador e **acesse o painel do seu Easypanel**.
2. Faça o login.
3. Se você ainda não tem um Projeto criado para o Investmais, clique em **"Create Project"** (Criar Projeto). Dê um nome para ele, como `investmais-projeto`.
4. Entre no projeto que você acabou de criar.
5. Clique no botão **"Create App"** (Criar App) ou **"Add Service"**.
6. Va na configuração "App" e no campo **Name** (Nome), escreva `investmais`.

---

## Passo 3: Dizendo ao Easypanel onde está o código

O Easypanel precisa saber qual é o seu GitHub para pegar o código de lá.

1. Dentro da página do seu App recém criado, clique na aba **"Source"** (Fonte/Origem).
2. Escolha a opção **GitHub**.
3. *Se for a primeira vez*, talvez o Easypanel peça autorização para conectar na sua conta do GitHub. Se isso acontecer, siga as telas e aceite.
4. No campo **Repository** (Repositório), procure e selecione o repositório do projeto `Investmais` na lista.
5. No campo **Branch**, digite `main` (ou `master` se for o caso).

---

## Passo 4: O Segredo de Tudo (Variáveis de Ambiente) ⚠️ MUITO IMPORTANTE!

O seu projeto usa senhas do Supabase que ficam escondidas no arquivo `.env.local` no seu computador. Mas o arquivo `.env.local` **não vai pro GitHub** (por segurança). Então, temos que colar elas direto lá no Easypanel!

1. No Easypanel, vá na aba **"Environment"** (Ambiente).
2. No seu computador, abra o arquivo `.env.local` do projeto.
3. Copie todo o conteúdo desse arquivo. Deve ser algo parecido com isto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   ```
4. **Cole essas informações** naquela caixa em branco na página de "Environment" do Easypanel.
5. Clique no botão azul/verde para **Salvar** ("Save").

---

## Passo 5: Mandando o servidor começar o trabalho!

Lembra que eu criei uma receita mágica chamada `Dockerfile`? O Easypanel vai ler essa receita agora.

1. Vá para a aba **"Build"** no Easypanel.
2. Certifique-se de que a opção selecionada seja **"Dockerfile"**. (Na maioria das vezes ele já entende sozinho, mas é bom conferir).
3. Agora, no canto superior direito, tem um botão verde grandão chamado **"Deploy"**. **Clique nele!**

O Easypanel vai começar a instalar todas as pecinhas, baixar o código e montar o site. Isso deve demorar uns **2 a 5 minutos**. Você pode clicar no botão "Deploy Logs" ou só acompanhar a bolinha ficar verde. 

Quando ficar tudo **verde e apontar "Running" (Rodando)**, parabéns, o sistema está de pé!

---

## Passo 6: Colocando o seu link (Seu Domínio)

Por fim, vamos colocar um endereço bonito na internet para acessar seu site (como "seu-site.com.br").

1. Vá na aba **"Domains"** (Domínios) no Easypanel.
2. Digite o seu domínio (ou subdomínio). Exemplo: `app.investmais.com.br`.
3. Certifique-se de marcar a opção **"HTTPS / Let's Encrypt"** para que seu site tenha o cadeadinho de segurança.
4. Clique em **Add** (Adicionar).

*(Atenção: Não se esqueça de ir num site como Cloudflare, Registro.br, ou onde você comprou o domínio e apontar o IP do seu servidor Easypanel para o domínio que você escolheu)*

---

Pronto! Acesse o seu site. Se der qualquer tela de erro, basta me avisar o que está escrito e consertamos juntos! 🚀
