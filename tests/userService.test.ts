import chai = require('chai');
import chaiHttp = require('chai-http');
import {decodeSession} from "../src/services/sessionService";
import {DecodeResult, Session} from "../src/models/sessionModel";
const expect = chai.expect
const baseUrl = "http://localhost:4000"
chai.use(chaiHttp);

const SECRET_KEY_TEST : string = "akljsdfbuw3 c;keh20342 f394nm0mc@!#!$%!F$^ e"

describe("User Service Tests", () => {
    let token : string;
    let userSession : Session;
    it('Should return successful sign up', (done) => {
        chai.request(baseUrl)
            .post('/users')
            .auth('test','test', {type:"basic"})
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

    it('Should return the information about the new user', (done) => {
        const decodedSession: DecodeResult = decodeSession(SECRET_KEY_TEST, token);
        if (decodedSession.type === 'valid'){
            userSession = decodedSession.session;
        } else{
            return;
        }
        chai.request(baseUrl)
            .get('/manage/users/' + userSession.id)
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.status).equal(200);
                console.log(response.body)
                expect(response.body.email).equal('test-email@test.com');
                expect(response.body.firstName).equal('test');
                expect(response.body.lastName).equal('test');
                expect(response.body.username).equal('test');
                expect(response.body._id).equal(userSession.id);
                done();
            });
    });



})
