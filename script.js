// Global variables
let apikey = '';
const rootPath = 'https://mysite.itvarsity.org/api/Contactbook/';

// Check if API key exists when page loads
function checkApiKey() {
  const storedApiKey = localStorage.getItem('apikey');
  if (storedApiKey) {
    apikey = storedApiKey;
    showContacts();
    getContacts();
  } else {
    showPage('setupPage');
  }
}

// Setup API key and store it
function setupApiKey() {
  const inputApiKey = document.getElementById('apiKeyInput');
  const apiKeyValue = inputApiKey.value.trim();

  if (!apiKeyValue) {
    alert('Please enter API key');
    return;
  }

  fetch(rootPath + "controller/api-key/?apikey=" + encodeURIComponent(apiKeyValue))
    .then(response => response.text())
    .then(data => {
      if (data === "1") {
        apikey = apiKeyValue;
        localStorage.setItem("apikey", apiKeyValue);
        showContacts();
        getContacts();
      } else {
        alert("Invalid API key entered.");
      }
    })
    .catch(() => {
      alert("Error validating your API key. Please try again.");
    });
}

// Show specific page by ID
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Show main contacts page
function showContacts() {
  showPage('contactPage');
}

// Show add contact page
function showAddContact() {
  showPage('addContactPage');
  // Clear add form
  document.getElementById('addContactForm').reset();
}

// Refresh contacts list
function refreshContacts() {
  getContacts();
}

// Fetch and display contacts
function getContacts() {
  const contactsList = document.getElementById('contactsList');
  contactsList.innerHTML = '<div class="loading">Loading contacts...</div>';

  fetch(rootPath + "controller/get-contacts/?apikey=" + encodeURIComponent(apikey))
    .then(response => response.json())
    .then(data => {
      displayContacts(data);
    })
    .catch(() => {
      contactsList.innerHTML = '<div class="error">Something went wrong, please try again later.</div>';
    });
}

// Display contacts on page
function displayContacts(contacts) {
  const contactsList = document.getElementById('contactsList');

  if (!contacts || contacts.length === 0) {
    contactsList.innerHTML = '<div class="loading">No contacts found. Add your first contact!</div>';
    return;
  }

  let html = '<div class="contacts-grid">';
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const avatarSrc = contact.avatar
      ? `${rootPath}controller/uploads/${contact.avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.firstname)}+${encodeURIComponent(contact.lastname)}&background=ff6b6b&color=fff&size=120`;

    html += `
  <div class="contact-card">
    <img src="${avatarSrc}" alt="Avatar" class="contact-avatar" />
    <div class="contact-name">${contact.firstname} ${contact.lastname}</div>
    <div class="contact-details">
      <p><strong>Mobile:</strong> ${contact.mobile}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
    </div>
    <div class="contact-actions">
      <button class="btn btn-secondary" onclick="showEditContact('${contact.id}')">Edit</button>
      <button class="btn btn-danger" onclick="deleteContact('${contact.id}')">Delete</button>
    </div>
  </div>
`;
  }
  html += '</div>';

  contactsList.innerHTML = html;
}

// Add a new contact
function addContact(event) {
  event.preventDefault();

  const form = new FormData(document.getElementById("addContactForm"));
  form.append('apikey', apikey);

  fetch(rootPath + 'controller/insert-contact/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, */*'
    },
    body: form
  })
    .then(response => response.text())
    .then(data => {
      if (data === "1") {
        alert("Contact added successfully!");
        showContacts();
        getContacts();
      } else {
        alert("Error adding contact: " + data);
      }
    })
    .catch(() => {
      alert("Something went wrong. Please try again.");
    });
}

// Show edit contact page and load data
function showEditContact(contactId) {
  fetch(rootPath + 'controller/get-contacts/?id=' + encodeURIComponent(contactId) + '&apikey=' + encodeURIComponent(apikey))
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const contact = data[0];

        // Show avatar if available
        if (contact.avatar) {
          const avatarImg = `<img src="${rootPath}controller/uploads/${contact.avatar}" width="200" style="border-radius: 10px;" />`;
          document.getElementById("editAvatarImage").innerHTML = avatarImg;
        } else {
          document.getElementById("editAvatarImage").innerHTML = '';
        }

        // Fill the form fields
        document.getElementById('editContactId').value = contact.id;
        document.getElementById('editFirstName').value = contact.firstname;
        document.getElementById('editLastName').value = contact.lastname;
        document.getElementById('editMobile').value = contact.mobile;
        document.getElementById('editEmail').value = contact.email;

        showPage('editContactPage');
      } else {
        alert("Contact not found.");
        showContacts();
      }
    })
    .catch(() => {
      alert('Error loading contact details.');
      showContacts();
    });
}

// Update contact
function updateContact(event) {
  event.preventDefault();

  const form = new FormData(document.getElementById("editContactForm"));
  form.append('apikey', apikey);

  fetch(rootPath + 'controller/edit-contact/', {
    method: 'POST',
    body: form
  })
    .then(response => response.text())
    .then(data => {
      if (data === "1") {
        alert("Contact updated successfully!");
        showContacts();
        getContacts();
      } else {
        alert('Error updating contact: ' + data);
      }
    })
    .catch(() => {
      alert('Something went wrong. Please try again.');
    });
}

// Delete contact
function deleteContact(contactId) {
  if (!confirm("Delete contact. Are you sure?")) {
    return;
  }

  fetch(rootPath + 'controller/delete-contact/?id=' + encodeURIComponent(contactId) + '&apikey=' + encodeURIComponent(apikey))
    .then(response => response.text())
    .then(data => {
      if (data === "1") {
        alert('Contact deleted successfully');
        getContacts();
      } else {
        alert('Error deleting contact: ' + data);
      }
    })
    .catch(() => {
      alert('Something went wrong. Please try again.');
    });
}

// On page load
window.onload = function () {
  checkApiKey();
};