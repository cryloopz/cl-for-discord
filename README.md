🧹 cl - Plugin para Equicord

Plugin que permite apagar TODAS as suas mensagens de um chat com um clique, atalho ou comando.


📥 Instalação

1. Clone o plugin na pasta de plugins:
   cd src/userplugins
   git clone https://github.com/seu-usuario/cl.git

2. Compile e injete:
   cd ../..
   pnpm build
   pnpm inject

3. Reinicie o Discord e ative o plugin nas configurações do Equicord.


🎯 Como Usar

1️⃣ Definir o Token (necessário uma vez)

Abra o console do Discord (Ctrl+Shift+I) e digite:

webpackChunkdiscord_app.push([], { 0: (e, t, i) => { 
    for (const key in i.c) {
        const mod = i.c[key]?.exports;
        if (mod?.getToken) {
            console.log("Token:", mod.getToken());
        }
    }
} })

Copie o token que aparecer e defina no plugin:

cl.setToken("SEU_TOKEN_AQUI")


2️⃣ Apagar Suas Mensagens

Método               | Como fazer
---------------------|-------------------------------
Botão no menu        | Clique direito em você mesmo → "cl - Apagar minhas mensagens"
Atalho de teclado    | Pressione Ctrl+Shift+C
Comando no chat      | Digite "cl" e aperte Enter
Console              | Digite cl.run()


📋 Comandos do Console

Comando                | O que faz
-----------------------|-----------------------------------
cl.run()               | Apaga suas mensagens do chat atual
cl.setToken("TOKEN")   | Define o token manualmente
cl.check()             | Verifica se o token está definido


⚠️ Limitações

- Só apaga suas próprias mensagens (não funciona em mensagens de outros)
- Mensagens com mais de 14 dias não podem ser apagadas (limitação do Discord)
- Não pede confirmação - clicou, já começa a apagar


👤 Autor

Feito por l1wn 🚀