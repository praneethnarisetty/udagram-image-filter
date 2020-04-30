# Udagram Image Filtering Microservice
Tasks
Setup Node Environment

[x] You'll need to create a new node server. Open a new terminal within the project directory and run:

  [x]    Initialize a new project: npm i
  [x]    run the development server with npm run dev

[x] Create a new endpoint in the server.ts file

The starter code has a task for you to complete an endpoint in ./src/server.ts which uses query parameter to download an image from a public URL, filter the image, and return the result.

We've included a few helper functions to handle some of these concepts and we're importing it for you at the top of the ./src/server.ts file.

import {filterImageFromURL, deleteLocalFiles} from './util/util';

[x] Deploying your system

Follow the process described in the course to eb init a new application and eb create a new environment to deploy your image-filter service! Don't forget you can use eb deploy to push changes.


> For deploying used ...

```terminal
  [x] npm run build
  [x] eb init
  [x] eb create
  [x] eb deploy
```

- AWS Elastic Beanstalk deployed application dashboard.
  ![depcruise generated graph](./deployment_screenshot/eb_app_deployed_and_running_on_aws.png)
# udagram-image-filter
## Using the backend
You can test the micro-service by sending a GET request:
```
GET /filteredimage?image_url={{IMAGE_URL}}
```
I.e.
```
http://image-filter-project-seidlr-dev-dev.eu-central-1.elasticbeanstalk.com/filteredimage?image_url=https://www.opensourcecms.com/wp-content/uploads/wordpress-logo.png
```
should return a changed image
