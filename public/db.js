// let db;
// const request = indexedDB.open("budget", 1);

// request.onupgradeneeded = function(event) {
//   const db = event.target.result;
//   db.createObjectStore("pending", { autoIncrement: true });
// };

// request.onsuccess = function(event) {
//   db = event.target.result;
// };

// request.onerror = function(event) {
//   console.log("Did not work! " + event.target.errorCode);
// };

// function saveRecord(record) {
//     console.log('Saved');

//   const transaction = db.transaction(["pending"], "readwrite");
//   const store = transaction.objectStore("pending");

//   store.add(record);
// }

// function checkDatabase() {
//   const transaction = db.transaction(["pending"], "readwrite");
//   const store = transaction.objectStore("pending");
//   const getAll = store.getAll();

//   console.log('getAll: ', getAll);

//   getAll.onsuccess = function() {
//     if (getAll.result.length > 0) {
//       fetch("/api/transaction/bulk", {
//         method: "POST",
//         body: JSON.stringify(getAll.result),
//         headers: {
//           Accept: "application/json, text/plain, */*",
//           "Content-Type": "application/json"
//         }
//       })
//       .then(response => response.json())
//       .then(() => {
//         const transaction = db.transaction(["pending"], "readwrite");

//         const store = transaction.objectStore("pending");

//         store.clear();
//       });
//     }
//   };
// }

// window.addEventListener("online", checkDatabase); 

// using db.js from trhe noSQL miniproject

let db;
let budgetVersion;

const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Error! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('check db invoked');

  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(['BudgetStore'], 'readwrite');

            const currentStore = transaction.objectStore('BudgetStore');

            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  store.add(record);
};

window.addEventListener('online', checkDatabase);
