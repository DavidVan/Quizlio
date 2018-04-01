var cardsets = JSON.parse(localStorage.getItem('quizlio')) || {}

var cards = []

let index = 0

const CREATE_A_CARD_ROUTE = 1;
const CARD_SET_ROUTE = 0;

var app = new Vue({
  el: '#client_app',
  data: {
    cardsets: cardsets,
    name: '',
    phone: '',
    cardset: '',
    language: 'en-US',
    front: '', back: '', route: CREATE_A_CARD_ROUTE
  },
  methods: {
    prev: function() {
      let card = cards.pop();

      this.front = card.front;
      this.back = card.back;
    },
    next: function() {
      if (this.name &&
          this.cardset &&
          this.phone &&
          this.cardset &&
          this.language &&
          this.front &&
          this.back)
      {
        let card = {
          front: this.front,
          back: this.back,
        }

        cards.push(card);
        ++index;

        this.front = '';
        this.back = '';
      }
    },
    save: function() {
      cardsets[this.cardset] = {
        cards: cards,
        language: this.language,
        name: this.name,
        phone: this.phone
      };

      localStorage.setItem('quizlio', JSON.stringify(cardsets));
      this.cardsets = cardsets;
    },
    setRoute1: function() {
      this.route = CREATE_A_CARD_ROUTE;
    },
    setRoute2: function() {
      this.route = CARD_SET_ROUTE;
    },
    edit: function(value) {
      console.log(value)
      this.name =  cardsets[value].name;
      this.phone = cardsets[value].phone;
      this.cardset = cardsets[value].cardset;
      this.language = cardsets[value].language;
      if (cardsets[value].length > 0) {
        this.front = cardsets[value].cards[0].front;
        this.back = cardsets[value].cards[0].back;
        this.route = CREATE_A_CARD_ROUTE;
      }
    },
    start: function(value) {
      var data = {
        Name: cardsets[value].name,,
        Phone: '+1' + cardsets[value].phone,
        Questions: {},
        Answers: {}
      };
      var cards = cardsets[value].cards;
      for (var i = 0; i < cards.length; i++) {
        data.Questions['Q' + i] = cards[i].front;
        data.Answers['A' + i] = cards[i].back;
      }
      axios.post('/', data)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }
})
