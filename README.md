# AS Dental

Site institucional estático em português brasileiro, construído com HTML, CSS e JavaScript nativos. Não há etapa de compilação nem dependências npm.

## Visualizar localmente

Abra `index.html` no navegador ou execute `npx serve .` nesta pasta.

## Configuração antes da publicação

Edite `images/site-config.js` somente com dados confirmados pela clínica. O arquivo centraliza:

- URL oficial do Simples Dental;
- WhatsApp, telefone, e-mail e horários;
- endereço complementar e busca do Google Maps;
- redes sociais e dados da pessoa jurídica/responsável técnico;
- equipe e avaliações aprovadas para publicação;
- ferramenta e identificador de analytics, após definir consentimento.

Os botões de agendamento e WhatsApp permanecem desativados enquanto seus destinos oficiais não estiverem configurados. Não adicione segredos ou dados de pacientes a esse arquivo.

## Conteúdo pendente de confirmação

As imagens em `images/home/` são demonstrativas, e estão identificadas como tal no site. Substitua-as por fotos autorizadas antes da publicação. O endereço do Shopping Nova América é uma referência preliminar; piso e sala não estão confirmados. A equipe, avaliações, contatos e dados profissionais também aguardam validação.

Não publique dados de CRO, responsável técnico, depoimentos ou informações operacionais sem aprovação da clínica. O site não coleta dados de saúde nem implementa formulário próprio.

## Páginas

- `index.html` — landing page
- `about.html` — apresentação da clínica
- `services.html` — tratamentos
- `team.html` — equipe
- `contact.html` — contato e localização
- `404.html` — página não encontrada
- `images/site.css` — sistema visual e responsividade
- `images/site.js` — interações, conversões e conteúdo condicional
- `images/site-config.js` — configuração pública da clínica

Navbar e footer são repetidos nas páginas estáticas; mantenha-os sincronizados ao editar a navegação.

## Pacote visual AS Dental V2

Os arquivos fornecidos no pacote de assets estão em `images/asdental-v2/`. O site usa os logos propostos, ícones de tratamentos e interface, avatar ilustrado do assistente, fotografia ilustrativa para o hero e a imagem conceitual da recepção. O pacote completo, incluindo originais PNG e variantes WebP, foi preservado.

As imagens de pessoas e ambientes foram geradas por IA. A recepção e a cena de atendimento estão identificadas como conceituais/ilustrativas; a equipe fictícia não é exibida como a equipe da clínica. A identidade visual do pacote é uma proposta e precisa de aprovação da AS Dental antes de ser adotada como marca definitiva.

As tags Open Graph apontam para o arquivo JPG do pacote em caminho relativo. Antes da divulgação em domínio definitivo, configure a URL absoluta de `og:image` e `twitter:image` com o domínio oficial. Confirme também a licença e autorização de uso comercial dos assets.
