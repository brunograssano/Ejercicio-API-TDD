import chai = require('chai');
import chaiHttp = require('chai-http');
const expect = chai.expect
const baseUrl = "http://localhost:4000"
chai.use(chaiHttp);

describe("User Service Tests", () => {
    let token;
    it('Should return successful sign up', (done) => {
        chai.request(baseUrl)
            .post('/users')
            .auth('user','pass', {type:"basic"})
            .send({'email':'test-email@test.com',
                    'firstName':'test',
                    'lastName':'test'})
            .end((error , response) => {
                expect(response.status).equal(201);
                expect(response.body.session).to.have.property("token");
                token = response.body.session.token;
                done();
            });
    });
})
