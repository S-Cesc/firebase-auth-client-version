import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
export { insertDisplayName, updateDisplayName }

async function updateDisplayName(db, uid, oldDisplayName, newDisplayName) {
    //1) comprobar disponible (deberia estar verificado, ahora en transacción)
    // Create a reference to the DisplayName doc.
    const newDisplayNameDocRef = doc(db, "displayNames", newDisplayName);
    await runTransaction(db, async (transaction) => {
        const newDisplayNameDoc = await transaction.get(newDisplayNameDocRef);
        if (newDisplayNameDoc.exists()) {
            console.log(newDisplayName + " exists.")
            throw "The display name already exists!";
        } else {
            // - Eliminar oldDisplayName de displayNames
            transaction.delete(doc(db, "displayNames", oldDisplayName));
            // - Insertar newDisplayName en displayNames
            transaction.set(newDisplayNameDocRef, { uid: uid });
            // - Actualizar users valor de displayName=newDisplayName
            transaction.set(doc(db, "users", uid), { displayName: newDisplayName });
        }
    });
}

async function insertDisplayName(db, uid, newDisplayName) {
    //1) comprobar disponible (deberia estar verificado, ahora en transacción)
    // Create a reference to the DisplayName doc.
    const newDisplayNameDocRef = doc(db, "displayNames", newDisplayName);
    await runTransaction(db, async (transaction) => {
        const newDisplayNameDoc = await transaction.get(newDisplayNameDocRef);
        if (newDisplayNameDoc.exists()) {
            console.log(newDisplayName + " exists.")
            throw "The display name already exists!";
        } else {
            //2) INSERT en displayNames + INSERT en users
            transaction.set(newDisplayNameDocRef, { uid: uid });
            transaction.set(doc(db, "users", uid), { displayName: newDisplayName });
        }
    });
}

//////////////   CÓDIGO REGLAS FIREBASE

// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /displayNames/{alias} {
//     	allow read: if request.auth != null
//       	&& request.auth.token.email_verified;
//       allow create: if (request.auth != null)
//         && (request.auth.token.email_verified)
//       	&& (resource == null)
//         && request.auth.uid == request.resource.data.uid
//         && (request.resource.data.keys().hasOnly(["uid"]));
//         /* 
//         	- only insert by owner allowed
//           - no existeix registre
//           - només l'atribut uid, que ha de ser el de l'owner
//         */
//       allow delete: if request.auth != null
//       	&& request.auth.token.email_verified
//       	&& request.auth.uid == resource.data.uid;
//         /* only delete by owner allowed */
//     }
//     match /users/{uuid} {
//     	allow read: if request.auth != null
//       	&& request.auth.token.email_verified;
//       allow write: if (request.auth != null)
//         && (request.auth.token.email_verified)
//         && (uuid == request.auth.uid)
//         && request.resource.data.keys().hasOnly(["displayName"]);
//         /* 
//         	- only write by owner allowed
//           - només l'atribut displayName
//         */
//     }
//     match /{document=**} {
//       allow read, write: if false;
//     }
//   }
// }


/*
//////////////////////////////////////////////
////////////   EJEMPLO DE TRANSACCIÓN   //////

{
    "writes": [
        {
            "delete": "projects/prova1-b9865/databases/(default)/documents/displayNames/cescacs"
        },
        {
            "update": {
                "name": "projects/prova1-b9865/databases/(default)/documents/displayNames/cescacsmasteroftheplanet",
                "fields": {
                    "uid": {
                        "stringValue": "CMhvCJTLglP7pI7mkNSsQVtekNr1"
                    }
                }
            },
            "currentDocument": {
                "exists": false
            }
        },
        {
            "update": {
                "name": "projects/prova1-b9865/databases/(default)/documents/users/CMhvCJTLglP7pI7mkNSsQVtekNr1",
                "fields": {
                    "displayName": {
                        "stringValue": "cescacsmasteroftheplanet"
                    }
                }
            }
        }
    ]
}

*/

////// EJEMPLO ACCESO A UN CAMPO ESPECÍFICO
////////////////////////////////////////////
//
// match /Nouns/{documents=**} {
//     allow read, write: if request.auth != null 
//                   && get(/databases/$(database)/documents/Users/$(request.auth.uid)).data.admin == true
//   }