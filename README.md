# firebase-auth-client-version

Use of serverless *Firebase Auth facilities*.

#### See also:
- [firebase-auth](https://github.com/S-Cesc/firebase-auth): Firebase auth basic  concepts.
- [firebase-auth-server-version](https://github.com/S-Cesc/firebase-auth-server-version): Express node (javascript) server implementation.

## Features

1. Client side (browser) javascript application.
2. Ensures a unique user profile name among registered users.
3. Can be expanded to build any Firebase application.

### Notes about using Firebase Auth serverless

- Firebase auth Web REST calls are used.
- The firestore configuration is public, and the *authoritation* lies with ***Firebase store rules***.
- Avoiding abuse of the *Firebase Firestore* backends lies with firestore rules used for ***data acces user authoritation***.
- The ***App-Check*** feature implemented in Firebase backends with ***Google reCAPTCHA*** allows the abuse protection of **public entry points** to *Firebase Firestore* (*public data*). Anyway, those public entry points to *Firebase Firestore* (*public data*), as well as *Firebase storage* and *Firebase Realtime database*, must be limited only to the very essential cases.
- The ***Firebase Authoritation* public entry points** are expected to have their own protection (as they do not use the *App-Check* facilities). Vulnerabilities can be read in the [Insecure-Firebase](https://github.com/tauh33dkhan/Hacking-Insecure-Firebase-Database), but the authoritation ones are expected to be now already corrected; other ones mainly come from the use of *public data*.

### Public data risc

A browser application has public code, and no secret values. Our application uses Firebase backends, where user secret password is checked and then the user is authenticated. The authenticated user owns authoritations to read and write data.

When some data can be read or written without an identified authenticated user there is a abuse risc of Firebase backends, which can be eased with the use of the *App-Check* implemented with *Google reCAPTCHA*. The *reCAPTCHA* function is to detect foreign programed executions (*robots*).

#### Limitations

The design is for small applications which do not have a lot of entry points; but, of course, it can be changed to fit a bigger application.

The use of client side pages means HTML is used directly, without templates nor other definitions to simplify design changes, and many changes need to be manually propagated among all the pages, or at least among many ones.

## The firebase requeriments to use the code

### Firebase Auth configuration

The "***/assets/firebase.mjs.incompleto***" file has the web app's Firebase configuration, and the correct value must be set in that file. The file must then be renamed as "***/assets/firebase.mjs***".

The ***firebase web app configuration and identification key*** is available in a public file, but it is not a critical issue, as the ***web app's Firebase configuration can remain as a public file*** with no lost of security because of the use of the *Firestore Web API*, and as long as *Firebase Store Rules* are correctly configured.

### Firestore configuration

To ensure the ***uniqueness of the user profile display names*** Firestore is used.

There must be two collections defined:
1. /users
2. /displayNames

#### Firebase Store Rules

Authoritation for the users to access Firestore data, defined only for the needed collections. Any additional data must define its own rules.

~~~
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /displayNames/{alias} {
    	allow read: if request.auth != null
      	&& request.auth.token.email_verified;
      allow create: if (request.auth != null)
        && (request.auth.token.email_verified)
      	&& (resource == null)
        && request.auth.uid == request.resource.data.uid
        && (request.resource.data.keys().hasOnly(["uid"]));
        /*
        	- only insert by owner allowed
          - no existeix registre
          - només l'atribut uid, que ha de ser el de l'owner
        */
      allow delete: if request.auth != null
      	&& request.auth.token.email_verified
      	&& request.auth.uid == resource.data.uid;
        /* only delete by owner allowed */
    }
    match /users/{uuid} {
    	allow read: if request.auth != null
      	&& request.auth.token.email_verified;
      allow write: if (request.auth != null)
        && (request.auth.token.email_verified)
        && (uuid == request.auth.uid)
        && request.resource.data.keys().hasOnly(["displayName"]);
        /*
        	- only write by owner allowed
          - només l'atribut displayName
        */
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
~~~

