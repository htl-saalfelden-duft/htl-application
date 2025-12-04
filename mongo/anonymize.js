/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'htlApplication';

// Create a new database.
use(database);

db.Applicant.updateMany({},{$set: {statusKey: 'completed', active: false}})

db.Applicant.updateMany(
    {},
    [
        {
            $set: {
                email: {
                    $function: {
                        body: function() {
                            return UUID().toString().split('"')[1];
                        },
                        args: [],
                        lang: "js"
                    }
                }
            }
        }
    ]
);

db.Applicant.updateMany({},{$unset: {
    'details.firstname': 1,
    'details.moreFirstname': 1,
    'details.lastname': 1,
    'details.svnr': 1
    }
})

db.Applicant.updateMany(
  {},
  { $set: { "contacts.$[].temp": null } }
)

db.Applicant.updateMany(
  {},
  {
    $unset: { 
        'contacts.$[elem].firstname': 1,
        'contacts.$[elem].lastname': 1,
        'contacts.$[elem].svnr': 1,
        'contacts.$[elem].street': 1,
        'contacts.$[elem].streetNr': 1,
        'contacts.$[elem].phone': 1,
        'contacts.$[elem].email': 1,
        'contacts.$[].temp': 1
    }
  },
  {
    arrayFilters: [
      { "elem.temp": null }
    ]
  }
)

