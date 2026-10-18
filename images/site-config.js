/* Dados públicos da clínica. Complete apenas após confirmação da AS Dental. */
window.ASDentalConfig = {
  name: 'AS Dental',
  bookingUrl: '',
  whatsappNumber: '', // DDI + DDD + número, somente dígitos.
  whatsappMessage: 'Olá! Gostaria de informações sobre uma avaliação na AS Dental.',
  phone: '',
  email: '',
  hours: '',
  location: {
    shoppingCenter: 'Shopping Nova América',
    address: 'Av. Pastor Martin Luther King Jr., 126',
    district: 'Del Castilho',
    city: 'Rio de Janeiro',
    state: 'RJ',
    suite: '',
    confirmed: false,
    mapSearchQuery: 'Shopping Nova América, Av. Pastor Martin Luther King Jr., 126, Del Castilho, Rio de Janeiro, RJ'
  },
  social: [],
  professional: {
    legalName: '',
    responsibleName: '',
    cro: ''
  },
  content: {
    teamApproved: false,
    team: [],
    testimonialsApproved: false,
    testimonials: []
  },
  analytics: {
    provider: '', // Deixe vazio até configurar ferramenta, IDs e consentimento.
    measurementId: ''
  }
};
