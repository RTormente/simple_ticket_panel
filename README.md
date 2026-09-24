<div align="center">

<img src="./readme/logo_color.svg" width="300">

</div>

# Painel de Senha

Um painel de senhas simples, abrangendo senhas comuns e preferenciais, desenvolvido inicialmente para atender a uma necessidade real de atendimento.

Possui as funcionalidades mínimas para uso, como avançar e retroceder senhas de forma incremental, repetir a senha atual e permitir alterar as senhas atuais manualmente.

Há alerta sonoro e leitura das senhas por voz, utilizando os recursos disponíveis no navegador do dispositivo utilizado para reproduzir o painel.

A versão apresentada neste projeto foi desenvolvida como uma aplicação web independente, podendo ser executada localmente ou disponibilizada em um servidor web para acesso por URL. Sendo assim, para um uso prático, basta utilizar um acesso remoto no dispositivo que executa o painel ou um teclado numérico sem fio conectado a ele.

Com a evolução do uso em ambiente real, o projeto também deu origem a uma versão cliente-servidor, desenvolvida posteriormente para atender a novas necessidades do ambiente. Essa versão será disponibilizada separadamente.

<div align="center">

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

![screaming_capture](./readme/screaming_capture.gif)

</div>

## Utilização

### Execução local

Não é necessária a instalação de dependências. Basta baixar ou clonar o projeto e abrir o arquivo `index.html` no navegador.

```bash
git clone https://github.com/RTormente/ticket_panel.git
```

Também é possível baixar o projeto diretamente pelo GitHub.

### Execução através de servidor web

Por ser uma aplicação estática, o projeto pode ser publicado em servidores web como Apache, Nginx ou outras soluções equivalentes.

Para uma utilização simples ou testes em rede, também é possível utilizar um servidor HTTP básico, como o disponibilizado pelo Python:

```bash
python -m http.server 8000
```

Executando o comando dentro da pasta do projeto, o painel estará disponível em:

```text
http://localhost:8000
```

Para acessar a partir de outro dispositivo da mesma rede, utilize o endereço IP do computador que está hospedando os arquivos:

```text
http://IP_DO_SERVIDOR:8000
```

### GitHub Pages

Uma versão publicada do projeto está disponível em:

[https://rtormente.github.io/ticket_panel/](https://rtormente.github.io/simple_ticket_panel/)

## Voz

A leitura das senhas utiliza a API `SpeechSynthesis` do navegador. As vozes disponíveis dependem do sistema operacional do dispositivo utilizado.

Em alguns ambientes Linux pode ser necessário instalar o pacote `speech-dispatcher` para disponibilizar recursos de síntese de voz.

As vozes disponibilizadas pelo `speech-dispatcher` podem apresentar uma qualidade bastante sintética e robótica. A instalação do pacote deve ser realizada no dispositivo que efetivamente irá reproduzir a voz do painel.

## Atalhos de teclado

Os atalhos das ações podem ser personalizados diretamente no painel.

No Firefox, a tecla `/` pode ser utilizada pelo próprio navegador para a função de busca rápida. Caso seja atribuída a alguma ação do painel, o navegador poderá interceptá-la.

Nesse caso, recomenda-se utilizar outra tecla ou desabilitar a função de busca rápida do navegador.

## Licença

Este projeto está disponível sob a licença MIT.
