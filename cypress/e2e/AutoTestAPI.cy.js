import { faker } from '@faker-js/faker';
import post from '../fixtures/post.json';
import user from '../fixtures/user.json';

post.id = faker.number.int();
post.userId = faker.number.int();
post.title = faker.string.alphanumeric();
post.body = faker.string.alphanumeric();
user.email = faker.internet.email();
user.password = faker.internet.password();

describe('AutoTestAPI', () => {

  it('Get all posts. Verify HTTP response status code and content type.', () => {
    cy.log(`GET all Posts`)

    cy.request({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      url: '/posts',
    }).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.headers['content-type']).to.include('application/json; charset=utf-8');

    })

  }),

    it('Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned.', () => {
      cy.log(`GET 10 First Posts`)

      cy.request({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        url: '/posts?_start=0&_end=10',
        }).then(response => {
        expect(response.status).to.be.equal(200);
        const posts = response.body;
        for (let i = 0; i < 10; i++) {
          expect(posts[i].id).to.eq(i + 1)
        };

      })

    }),

    it('Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.', () => {
      cy.log(`GET Posts with ids`)

      cy.request({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        url: '/posts?id=55&id=60'
      }).then(response => {
        expect(response.status).to.be.equal(200);
        const posts = response.body;
        const postIds = posts.map((post) => post.id);
        expect(postIds).to.include(55);
        expect(postIds).to.include(60);

      })

    }),

    it('Create a post. Verify HTTP response status code.', () => {
      cy.log(`Create a Post with 401`)

      cy.request({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        url: '/664/posts',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.equal(401);
      })

    }),

    it('Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
      cy.log(`Create post entity with access token`)

      cy.request({
        method: 'POST',
        url: '/register',
        body: {
          email: `${user.email}`,
          password: `${user.password}`,
        },
      }).then((registerResponse) => {
        expect(registerResponse.status).to.eq(201);
        expect(registerResponse.body).to.have.property('accessToken');
        const accessToken = registerResponse.body.accessToken;

        cy.request({
          method: 'POST',
          url: `/664/posts/`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }


        }).then((response) => {
          expect(response.status).to.eq(201);
          post.id = response.body.id

          cy.request({
            method: 'GET',
            url: `/posts/${post.id}`,
          }).then((getPostResponse) => {
            expect(getPostResponse.status).to.eq(200);
            expect(getPostResponse.body.id).to.eq(post.id);
          });
        });
      });
    }),

    it('Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
      cy.log(`Create Post with JSON body`)
      const newUserEmail = faker.internet.email();
      const newUserPassword = faker.internet.password();
      cy.request({
        method: 'POST',
        url: '/register',
        body: {
          email: `${newUserEmail}`,
          password: `${newUserPassword}`,
        },
      }).then((registerResponse) => {
        expect(registerResponse.status).to.eq(201);
        expect(registerResponse.body).to.have.property('accessToken');
        const accessToken = registerResponse.body.accessToken;

        cy.request({
          method: 'POST',
          url: `posts/`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: {
            title: 'New Post',
            body: 'This is the content of the new post.',
          }

        }).then((response) => {
          expect(response.status).to.eq(201);
          post.id = response.body.id

          cy.request({
            method: 'GET',
            url: `/posts/${post.id}`,
          }).then((getPostResponse) => {
            expect(getPostResponse.status).to.eq(200);
            expect(getPostResponse.body.id).to.eq(post.id);
          });
        });
      });

    }),
    it('Update non-existing entity. Verify HTTP response status code.', () => {
      cy.log(`PUT non-existent Post`)

      cy.request({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        url: '/posts',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.equal(404);

      })

    }),

    it('Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
      cy.log(`Create and Update Post`)

      const newUserEmail = faker.internet.email();
      const newUserPassword = faker.internet.password();
      cy.request({
        method: 'POST',
        url: '/register',
        body: {
          email: `${newUserEmail}`,
          password: `${newUserPassword}`,
        },
      }).then((registerResponse) => {
        expect(registerResponse.status).to.eq(201);
        expect(registerResponse.body).to.have.property('accessToken');
        const accessToken = registerResponse.body.accessToken;

        cy.request({
          method: 'POST',
          url: `posts/`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: {
            title: 'The Post',
            body: 'This is some new content.',
          }

        }).then((response) => {
          expect(response.status).to.eq(201);
          post.id = response.body.id

          post.title = 'Update';
          post.body = 'This is updated content.';
          cy.request({
            method: 'PUT',
            url: `/posts/${post.id}`,
            post,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: {
              title: 'Update',
              body: 'This is updated content.',
            }


          }).then((responce) => {
            expect(responce.status).to.eq(200);
            expect(responce.body.title).to.eq(post.title);
            expect(responce.body.body).to.eq(post.body);

          });

          cy.request({
            method: 'GET',
            url: `/posts/${post.id}`,
          }).then((getPutResponce) => {
            expect(getPutResponce.status).to.eq(200);
            expect(getPutResponce.body.id).to.eq(post.id);
            expect(getPutResponce.body.title).to.eq(post.title);
            expect(getPutResponce.body.body).to.eq(post.body);
          });
        });
      });

    }),

    it('Delete non-existing post entity. Verify HTTP response status code.', () => {
      cy.log(`Delete non-existing post`)

      cy.request({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        url: '/posts',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.be.equal(404);
      })

    }),

    it('Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {
      cy.log(`Create, Update, Delete Post`)

      const newUserEmail = faker.internet.email();
      const newUserPassword = faker.internet.password();
      cy.request({
        method: 'POST',
        url: '/register',
        body: {
          email: `${newUserEmail}`,
          password: `${newUserPassword}`,
        },
      }).then((registerResponse) => {
        expect(registerResponse.status).to.eq(201);
        expect(registerResponse.body).to.have.property('accessToken');
        const accessToken = registerResponse.body.accessToken;

        cy.request({
          method: 'POST',
          url: `posts/`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: {
            title: 'The Post',
            body: 'This is some new content.',
          }

        }).then((response) => {
          expect(response.status).to.eq(201);
          post.id = response.body.id

          post.title = 'Update';
          post.body = 'This is updated content.';
          cy.request({
            method: 'PUT',
            url: `/posts/${post.id}`,
            post,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: {
              title: 'Update',
              body: 'This is updated content.',
            }


          }).then((responce) => {
            expect(responce.status).to.eq(200);
            expect(responce.body.title).to.eq(post.title);
            expect(responce.body.body).to.eq(post.body);

          });
          cy.request({
            method: 'DELETE',
            url: `/posts/${post.id}`,
          }).then((getPutResponce) => {
            expect(getPutResponce.status).to.eq(200);
          });
          cy.request({
            method: 'GET',
            url: `/posts/${post.id}`,
            failOnStatusCode: false
          }).then((getPutResponce) => {
            expect(getPutResponce.status).to.eq(404);
          });
        });
      });
    })
})