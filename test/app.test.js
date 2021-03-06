require('dotenv').config();
require('../lib/utils/connect')();
const request = require('supertest');
const app = require('../lib/app');
const mongoose = require('mongoose');


describe('Colors app', () => {

  const createColor = (name) => {
    return request(app)
      .post('/colors')
      .send({ 
        name: name,
        hex: 'hex',
        rgb: 'rgb'
      })
      .then(res => res.body); 
  };

  beforeEach(done => {
    return mongoose.connection.dropDatabase(() => {
      done();
    });
  });

  afterAll((done) => {
    mongoose.connection.close(done);
  });

  it('can create a new color', () => {
    return request(app)
      .post('/colors')
      .send({
        name: 'yellow',
        hex: '#FFFF00',
        rgb: 'rgb(255,255,0)'
      })
      .then(res => {
        expect(res.body).toEqual({
          name: 'yellow',
          hex: '#FFFF00',
          rgb: 'rgb(255,255,0)',
          _id: expect.any(String),
          __v: 0
        });
      });
  });

  it('can get a list of colors', () => {
    return Promise.all(['yellow', 'blue', 'black'].map(createColor))
      .then(() => {
        return request(app)
          .get('/colors');
      })
      .then(res => {
        expect(res.body).toHaveLength(3);
      });
  });

  it('can get a color by id', () => {
    return createColor('blue')
      .then(createdColor => {
        return request(app)
          .get(`/colors/${createdColor._id}`)
          .then(res => {
            expect(res.body).toEqual({
              name: 'blue',
              hex: 'hex',
              rgb: 'rgb',
              _id: expect.any(String),
              __v: 0
            });
          });
      });
  });

  it('can find a color by id and delete', () => {
    return createColor('black')
      .then(createdColor => {
        return request(app)
          .delete(`/colors/${createdColor._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({ deleted: 1 });
      });
  });
});
