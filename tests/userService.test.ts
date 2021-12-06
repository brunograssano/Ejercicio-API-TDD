import chai = require('chai');
import chaiHttp = require('chai-http');
import {decodeSession} from "../src/services/sessionService";
import {DecodeResult, Session} from "../src/models/sessionModel";
const expect = chai.expect
const baseUrl = "http://localhost:4000"
chai.use(chaiHttp);

const SECRET_KEY_TEST : string = "akljsdfbuw3 c;keh20342 f394nm0mc@!#!$%!F$^ e"

describe("User Service Tests", () => {
    let token1 : string;
    let userSession1 : Session;

    let token2 : string;
    let userSession2 : Session;

    it('Should return successful sign up', (done) => {
        chai.request(baseUrl)
            .post('/users')
            .auth('test','test', {type:"basic"})
            .send({'email':{'value':'test-email@test.com','public':false},
                'firstName':{'value':'test','public':true},
                'lastName':{'value':'test','public':true}})
            .end((error , response) => {
                expect(response.status).equal(201);
                token1 = response.body.DEBUG.token;
                done();
            });
    });

    it('Should return user needs to validate email if trying to update info', (done) => {
        const decodedSession: DecodeResult = decodeSession(SECRET_KEY_TEST, token1);
        if (decodedSession.type === 'valid'){
            userSession1 = decodedSession.session;
        } else{
            return;
        }
        chai.request(baseUrl)
            .patch('/manage/users/' + userSession1.id)
            .set('JWT-Token',token1)
            .send({'firstName':{'value':'test1','public':true},
                'lastName':{'value':'test2','public':true},
                'nickname':{'value':'testNick','public':true}})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('Validate the email to continue');
                done();
            });
    });

    it('Should return user needs to validate email if trying to log in', (done) => {
        chai.request(baseUrl)
            .post('/login/users')
            .auth('test','test', {type:"basic"})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('Validate the email to continue');
                done();
            });
    });

    it('Should validate the email of the user', (done) => {
        chai.request(baseUrl)
            .post('/validate/email')
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Email validated successfully, please login to continue");
                done();
            });
    });

    it('Should return the information about the new user', (done) => {
        chai.request(baseUrl)
            .get('/manage/users/' + userSession1.id)
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.user.email.value).equal('test-email@test.com');
                expect(response.body.user.firstName.value).equal('test');
                expect(response.body.user.lastName.value).equal('test');
                expect(response.body.user.username).equal('test');
                expect(response.body.user._id).equal(userSession1.id);
                done();
            });
    });

    it('Should return that the user has no photo', (done) => {
        chai.request(baseUrl)
            .get('/resources/photo/test')
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('There is no photo');
                done();
            });
    });

    it('Should update the information about the user', (done) => {
        chai.request(baseUrl)
            .patch('/manage/users/' + userSession1.id)
            .set('JWT-Token',token1)
            .send({'firstName':{'value':'test1','public':true},
                'lastName':{'value':'test2','public':true},
                'nickname':{'value':'testNick','public':true}})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully updated user');
                done();
            });
    });

    it('Should update the photo of the user', (done) => {
        chai.request(baseUrl)
            .patch('/resources/photo/test')
            .set('JWT-Token',token1)
            .send({'photo': {'value':'testPhotoInBase64','public':true}})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully updated photo');
                done();
            });
    });


    it('Should return the information about the updated user', (done) => {
        chai.request(baseUrl)
            .get('/manage/users/' + userSession1.id)
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.user.email.value).equal('test-email@test.com');
                expect(response.body.user.firstName.value).equal('test1');
                expect(response.body.user.lastName.value).equal('test2');
                expect(response.body.user.nickname.value).equal('testNick');
                done();
            });
    });

    it('Should return the photo of the user', (done) => {
        chai.request(baseUrl)
            .get('/resources/photo/test')
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Photo sent successfully');
                expect(response.body.payload.photo).equal('testPhotoInBase64');
                done();
            });
    });

    it('Should make the photo of the user private', (done) => {
        chai.request(baseUrl)
            .patch('/resources/photo/test')
            .set('JWT-Token',token1)
            .send({'photo': {'public':false}})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully updated photo');
                done();
            });
    });

    it('Should return that the photo is private', (done) => {
        chai.request(baseUrl)
            .get('/resources/photo/test')
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('The photo is private');
                done();
            });
    });

    it('Should return that the user has no contacts', (done) => {
        chai.request(baseUrl)
            .get('/manage/contacts/' + userSession1.id)
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('There are no contacts');
                done();
            });
    });

    it('Should return that the user cannot delete a contact if it has none', (done) => {
        chai.request(baseUrl)
            .delete('/manage/contacts/' + userSession1.id)
            .set('JWT-Token',token1)
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
            .set('JWT-Token',token1)
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
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.body.message).equal('Successfully logged in');
                expect(response.status).equal(201);
                expect(response.body.session).to.have.property("token");
                done();
            });
    });

    it('Should return successful sign up for the second test user', (done) => {
        chai.request(baseUrl)
            .post('/users')
            .auth('test2','test2', {type:"basic"})
            .send({'email':{'value':'test-email2@test.com','public':false},
                'firstName':{'value':'testFirstName2','public':true},
                'lastName':{'value':'testLastName2','public':true},
                'nickname':{'value':'nickOfTestUser2','public':false},
                'gender':{'value':'genderTest2','public':true},
                'preferences':[{
                        "preferenceType":"LibrosTest",
                        "value":"FantasticosTest",
                        "public":true
                    },
                    {
                        "preferenceType":"PeliculasTest",
                        "value":"AccionTest",
                        "public":false
                    }]
            })
            .end((error , response) => {
                expect(response.status).equal(201);
                token2 = response.body.DEBUG.token;
                done();
            });
    });

    it('Should validate the email of the test user2', (done) => {
        const decodedSession: DecodeResult = decodeSession(SECRET_KEY_TEST, token2);
        if (decodedSession.type === 'valid'){
            userSession2 = decodedSession.session;
        } else{
            return;
        }
        chai.request(baseUrl)
            .post('/validate/email')
            .set('JWT-Token',token2)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Email validated successfully, please login to continue");
                done();
            });
    });

    it('test1 should invite test2 to be a contact', (done) => {
        chai.request(baseUrl)
            .post('/invite/contact')
            .set('JWT-Token',token1)
            .send({'contactUsername': 'test2','message':'Accept the invitation test2'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Contact invite sent successfully.');
                done();
            });
    });

    it('Should return that test user2 has a pending contact', (done) => {
        chai.request(baseUrl)
            .get('/manage/users/' + userSession2.id)
            .set('JWT-Token',token2)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.user.pendingContacts[0]).equal('test');
                done();
            });
    });

    it('test1 should not be able to invite test2 again while the invitation is active', (done) => {
        chai.request(baseUrl)
            .post('/invite/contact')
            .set('JWT-Token',token1)
            .send({'contactUsername': 'test2','message':'Accept the invitation test2'})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('Cannot invite again a contact');
                done();
            });
    });

    it('should not be possible to invite yourself', (done) => {
        chai.request(baseUrl)
            .post('/invite/contact')
            .set('JWT-Token',token1)
            .send({'contactUsername': 'test','message':'Accept the invitation test1'})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('Cannot invite yourself');
                done();
            });
    });

    it('should not be possible to invite a user that does not exists', (done) => {
        chai.request(baseUrl)
            .post('/invite/contact')
            .set('JWT-Token',token1)
            .send({'contactUsername': 'test3','message':'Accept the invitation test3'})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('User doesn\'t exists');
                done();
            });
    });

    it('test2 should be able to accept test2 invitation', (done) => {
        chai.request(baseUrl)
            .post('/accept/contact')
            .set('JWT-Token',token2)
            .send({'contactUsername': 'test'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Contact accepted successfully.');
                done();
            });
    });

    it('Should return that test user2 has no pending contacts', (done) => {
        chai.request(baseUrl)
            .get('/manage/users/' + userSession2.id)
            .set('JWT-Token',token2)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.user.pendingContacts.length).equal(0);
                done();
            });
    });

    it('Should return that test user1 has test2 as a contact', (done) => {
        chai.request(baseUrl)
            .get('/manage/contacts/' + userSession1.id)
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.contacts.length).equal(1);
                done();
            });
    });

    it('should not be possible to invite a user that is already a contact', (done) => {
        chai.request(baseUrl)
            .post('/invite/contact')
            .set('JWT-Token',token1)
            .send({'contactUsername': 'test2','message':'Accept the invitation test2'})
            .end((error , response) => {
                expect(response.status).equal(400);
                expect(response.body.message).equal('Already a contact');
                done();
            });
    });

    it('Should return that test user1 deleted test2 as a contact', (done) => {
        chai.request(baseUrl)
            .delete('/manage/contacts/' + userSession1.id)
            .set('JWT-Token',token1)
            .send({name:'test2'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Contact deleted successfully');
                done();
            });
    });

    it('Should return that test user1 has no contacts', (done) => {
        chai.request(baseUrl)
            .get('/manage/contacts/' + userSession1.id)
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("There are no contacts");
                done();
            });
    });

    it('Should search for users whose username includes test', (done) => {
        chai.request(baseUrl)
            .get('/search/users')
            .query({username:'test'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Searched successfully");
                expect(response.body.users.length).equal(2);
                done();
            });
    });

    it('Should search for users with preference for LibrosT', (done) => {
        chai.request(baseUrl)
            .get('/search/users')
            .query({preferenceType:'LibrosT'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Searched successfully");
                expect(response.body.users.length).equal(1);
                done();
            });
    });

    it('Should not return the user with nickname nickOfTestUser2 as it is private', (done) => {
        chai.request(baseUrl)
            .get('/search/users')
            .query({nickname:'nickOfTestUser2'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Searched successfully");
                expect(response.body.users.length).equal(0);
                done();
            });
    });

    it('Should add preferences to the user test1', (done) => {
        chai.request(baseUrl)
            .patch('/manage/users/' + userSession1.id)
            .set('JWT-Token',token1)
            .send({'preferences':[{
                        "preferenceType":"LibrosTest",
                        "value":"FantasticosTest",
                        "public":true
                    },
                    {
                        "preferenceType":"PeliculasTest",
                        "value":"AccionTest",
                        "public":true
                    }]})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully updated user');
                done();
            });
    });

    it('Should search for users with preference for LibrosT and Fantasticos', (done) => {
        chai.request(baseUrl)
            .get('/search/users')
            .query({preferenceType:'LibrosT',preferenceValue:'Fantasticos'})
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal("Searched successfully");
                expect(response.body.users.length).equal(2);
                done();
            });
    });


    it('Should return that the user test 1 deleted the account', (done) => {
        chai.request(baseUrl)
            .delete('/manage/users/' + userSession1.id)
            .set('JWT-Token',token1)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully deleted user');
                done();
            });
    });

    it('Should return that the user test 2 deleted the account', (done) => {
        chai.request(baseUrl)
            .delete('/manage/users/' + userSession1.id)
            .set('JWT-Token',token2)
            .end((error , response) => {
                expect(response.status).equal(200);
                expect(response.body.message).equal('Successfully deleted user');
                done();
            });
    });

})
