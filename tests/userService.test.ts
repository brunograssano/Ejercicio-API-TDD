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
            .send({'email':'test-email@test.com', 'firstName':'test', 'lastName':'test'})
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
                expect(response.body.email).equal('test-email@test.com');
                expect(response.body.firstName).equal('test');
                expect(response.body.lastName).equal('test');
                expect(response.body.username).equal('test');
                expect(response.body._id).equal(userSession.id);
                done();
            });
    });

    it('Should update the information about the user', (done) => {
        chai.request(baseUrl)
            .patch('/manage/users/' + userSession.id)
            .set('JWT-Token',token)
            .send({'firstName':'test1', 'lastName':'test2', 'nickname':'testNick', 'photo': {'value':'testPhotoInBase64','public':true}})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully updated user');
                done();
            });
    });

    it('Should return the information about the updated user', (done) => {
        chai.request(baseUrl)
            .get('/manage/users/' + userSession.id)
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.email).equal('test-email@test.com');
                expect(response.body.firstName).equal('test1');
                expect(response.body.lastName).equal('test2');
                expect(response.body.nickname).equal('testNick');
                expect(response.body.photo.value).equal('testPhotoInBase64');
                expect(response.body.photo.public).equal(true);
                done();
            });
    });

    it('Should return that the user has no contacts', (done) => {
        chai.request(baseUrl)
            .get('/manage/contacts/' + userSession.id)
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('There are no contacts');
                done();
            });
    });

    it('Should return that the user cannot delete a contact if it has none', (done) => {
        chai.request(baseUrl)
            .delete('/manage/contacts/' + userSession.id)
            .set('JWT-Token',token)
            .send({'name':'test'})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('There are no contacts to delete');
                done();
            });
    });


})
