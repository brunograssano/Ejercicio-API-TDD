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
            .send({'email':{'value':'test-email@test.com','public':false},
                'firstName':{'value':'test','public':true},
                'lastName':{'value':'test','public':true}})
            .end((error , response) => {
                expect(response.status).equal(201);
                token = response.body.DEBUG.token;
                done();
            });
    });

    it('Should validate the email of the user', (done) => {
        chai.request(baseUrl)
            .post('/validate/email')
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Email validated successfully, please login to continue");
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
                expect(response.body.user.email.value).equal('test-email@test.com');
                expect(response.body.user.firstName.value).equal('test');
                expect(response.body.user.lastName.value).equal('test');
                expect(response.body.user.username).equal('test');
                expect(response.body.user._id).equal(userSession.id);
                done();
            });
    });

    it('Should update the information about the user', (done) => {
        chai.request(baseUrl)
            .patch('/manage/users/' + userSession.id)
            .set('JWT-Token',token)
            .send({'firstName':{'value':'test1','public':true},
                'lastName':{'value':'test2','public':true},
                'nickname':{'value':'testNick','public':true},
                'photo': {'value':'testPhotoInBase64','public':true}})
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
                expect(response.body.user.email.value).equal('test-email@test.com');
                expect(response.body.user.firstName.value).equal('test1');
                expect(response.body.user.lastName.value).equal('test2');
                expect(response.body.user.nickname.value).equal('testNick');
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

    it('Should return user not found when using a wrong password in an existing user', (done) => {
        chai.request(baseUrl)
            .post('/login/users')
            .auth('test','test1', {type:"basic"})
            .end((error , response) => {
                expect(response.status).equal(404);
                expect(response.body.message).equal('User not found');
                done();
            });
    });

    it('Should return user not found when a user does not exists', (done) => {
        chai.request(baseUrl)
            .post('/login/users')
            .auth('test2','test2', {type:"basic"})
            .end((error , response) => {
                expect(response.status).equal(404);
                expect(response.body.message).equal('User not found');
                done();
            });
    });

    it('Should return a new token when logged in', (done) => {
        chai.request(baseUrl)
            .post('/login/users')
            .auth('test','test', {type:"basic"})
            .end((error , response) => {
                expect(response.status).equal(201);
                expect(response.body.message).equal('Successfully logged in');
                expect(response.body.session).to.have.property("token");
                done();
            });
    });

    it('Should return a new token when the user changes password', (done) => {
        chai.request(baseUrl)
            .patch('/login/users')
            .auth('test','testNewPassword', {type:"basic"})
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.body.message).equal('Successfully updated password');
                expect(response.status).equal(201);
                expect(response.body.session).to.have.property("token");
                done();
            });
    });

    it('Should return a new token when logging in with the new password', (done) => {
        chai.request(baseUrl)
            .post('/login/users')
            .auth('test','testNewPassword', {type:"basic"})
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.body.message).equal('Successfully logged in');
                expect(response.status).equal(201);
                expect(response.body.session).to.have.property("token");
                done();
            });
    });

    it('Should return that the user deleted the account', (done) => {
        chai.request(baseUrl)
            .delete('/manage/users/' + userSession.id)
            .set('JWT-Token',token)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully deleted user');
                done();
            });
    });


})
