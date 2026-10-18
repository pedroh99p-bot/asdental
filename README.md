# AS Dental

Site institucional estático em português brasileiro, construído com HTML, CSS e JavaScript nativos. Não há etapa de compilação nem dependências npm.

## Visualizar localmente

Execute `npx serve .` nesta pasta e abra `http://localhost:3000`; em localhost, a prévia ilustrativa é ativada automaticamente. Também é possível abrir `index.html?preview=1` para ver os exemplos em outros hosts. A faixa amarela informa que perfis, relatos e estrelas são fictícios e servem apenas para revisar o layout.

## Configuração antes da publicação

Edite `images/site-config.js` somente com dados confirmados pela clínica. O arquivo centraliza:

- URL oficial do Simples Dental;
- WhatsApp, telefone, e-mail e horários;
- endereço complementar e busca do Google Maps;
- redes sociais e dados da pessoa jurídica/responsável técnico;
- equipe e avaliações aprovadas para publicação;
- ferramenta e identificador de analytics, após definir consentimento.

Em páginas públicas, os botões de agendamento e WhatsApp ficam desativados enquanto seus destinos oficiais não estiverem configurados. Na prévia, eles ficam clicáveis para demonstrar a interação, mas exibem uma mensagem e não abrem um destino pendente. O número de WhatsApp no arquivo é apenas um candidato e `whatsappConfirmed` permanece `false`. Não adicione segredos ou dados de pacientes a esse arquivo.

## Prévia e publicação

`images/site.js` só insere os perfis e depoimentos de exemplo em localhost ou com `?preview=1`. A avaliação Google real fica oculta até que `google.verified`, a URL da ficha e os dados confirmados sejam configurados. O perfil da equipe e os relatos também exigem as respectivas flags de aprovação e conteúdo revisado. Antes de publicar, confirme identidade visual, endereço exato, contatos, agendamento e dados profissionais com a clínica; remova `?preview=1` dos links compartilhados.

## Conteúdo pendente de confirmação

As imagens de pessoas e ambientes em `images/asdental-v2/` são demonstrativas. A foto composta da equipe só aparece dentro da prévia e está identificada como ilustração. Substitua imagens por fotos autorizadas antes da publicação. O endereço do Shopping Nova América é uma referência preliminar; piso e sala não estão confirmados. A equipe, avaliações, contatos e dados profissionais também aguardam validação.

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
