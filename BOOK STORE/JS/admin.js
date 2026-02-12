// API Configuration from config.js

let currentEditBookId = null;

// Check if user is authenticated

function isAuthenticated() {
  return localStorage.getItem("noveliaToken") !== null;
}

// Get auth token from localStorage

function getAuthToken() {
  return localStorage.getItem("noveliaToken");
}

// Tab switching

function initTabs() {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      menuItems.forEach((mi) => mi.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all tab contents
      document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
      });

      // Show selected tab
      const tabName = this.getAttribute("data-tab");
      document.getElementById(`${tabName}-tab`).classList.add("active");

      // Load data for the tab
      if (tabName === "users") {
        fetchUsers();
      } else if (tabName === "books") {
        fetchBooks();
      }
    });
  });
}

// Fetch all users from API

async function fetchUsers() {
  const token = getAuthToken();

  if (!token) {
    alert("Please login as admin to access this page");
    window.location.href = "./login.html";
    return;
  }

  try {
    const API_BASE_URL =
      window.API_CONFIG?.API_BASE_URL || "http://127.0.0.1:8000/api";
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayUsers(data.users);
      updateUserStats(data.users);
    } else if (response.status === 403) {
      alert("You do not have admin privileges");
      window.location.href = "../index.html";
    } else if (response.status === 401) {
      alert("Your session has expired. Please login again.");
      localStorage.clear();
      window.location.href = "./login.html";
    } else {
      throw new Error("Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    document.getElementById("usersTableBody").innerHTML =
      '<tr><td colspan="5" class="error">Failed to load users. Please try again.</td></tr>';
  }
}

// Display users in table

function displayUsers(users) {
  const tbody = document.getElementById("usersTableBody");

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="no-data">No users registered yet</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>${user.email}</td>
            <td>${user.name || "N/A"}</td>
            <td>${user.phone || "N/A"}</td>
            <td>${user.location || "N/A"}</td>
            <td>${new Date(user.date_joined).toLocaleDateString()}</td>
        </tr>
    `,
    )
    .join("");
}

// Update user statistics

function updateUserStats(users) {
  document.getElementById("totalUsers").textContent = users.length;

  // Calculate recent users (joined in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsers = users.filter(
    (user) => new Date(user.date_joined) > thirtyDaysAgo,
  );

  document.getElementById("recentUsers").textContent = recentUsers.length;
}

// Fetch all books from API

async function fetchBooks() {
  const token = getAuthToken();
  const API_BASE_URL =
    window.API_CONFIG?.API_BASE_URL || "http://127.0.0.1:8000/api";

  try {
    const response = await fetch(`${API_BASE_URL}/books/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayBooks(data.books || []);
      updateBookStats(data.books || []);
    } else {
      throw new Error("Failed to fetch books");
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    document.getElementById("booksTableBody").innerHTML =
      '<tr><td colspan="5" class="error">Failed to load books. Please try again.</td></tr>';
  }
}

// Display books in table

function displayBooks(books) {
  const tbody = document.getElementById("booksTableBody");

  if (books.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="no-data">No books available yet</td></tr>';
    return;
  }

  tbody.innerHTML = books
    .map(
      (book) => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editBook(${book.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteBook(${book.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Update book statistics

function updateBookStats(books) {
  document.getElementById("totalBooks").textContent = books.length;

  // Calculate unique genres
  const uniqueGenres = [...new Set(books.map((book) => book.genre))];
  document.getElementById("totalGenres").textContent = uniqueGenres.length;
}

// Open add book modal

function openAddBookModal() {
  document.getElementById("modalTitle").textContent = "Add New Book";
  document.getElementById("bookForm").reset();
  currentEditBookId = null;
  document.getElementById("bookModal").classList.add("active");
}

// Edit book

async function editBook(bookId) {
  const token = getAuthToken();
  const API_BASE_URL =
    window.API_CONFIG?.API_BASE_URL || "http://127.0.0.1:8000/api";

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      const book = await response.json();

      // Populate form
      document.getElementById("bookTitle").value = book.title;
      document.getElementById("bookAuthor").value = book.author;
      document.getElementById("bookGenre").value = book.genre;
      document.getElementById("bookDescription").value = book.description;

      // Set modal title and track book ID
      document.getElementById("modalTitle").textContent = "Edit Book";
      currentEditBookId = bookId;

      // Show modal
      document.getElementById("bookModal").classList.add("active");
    }
  } catch (error) {
    console.error("Error fetching book:", error);
    alert("Failed to load book details");
  }
}

// Delete book

async function deleteBook(bookId) {
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  const token = getAuthToken();
  const API_BASE_URL =
    window.API_CONFIG?.API_BASE_URL || "http://127.0.0.1:8000/api";

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response.ok) {
      alert("Book deleted successfully!");
      fetchBooks();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to delete book");
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    alert("An error occurred while deleting the book");
  }
}

// Upload a file to Cloudinary (unsigned upload)
async function uploadToCloudinary(file, folder) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url;
}

// Submit book form (create or update)

async function submitBookForm(e) {
  e.preventDefault();

  const token = getAuthToken();

  // Get submit button and add loading state
  const submitBtn = document.getElementById("submitBookBtn");
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.style.opacity = "0.7";
  submitBtn.style.cursor = "not-allowed";

  try {
    // Upload files to Cloudinary first
    let coverImageUrl = null;
    let pdfFileUrl = null;

    const coverFile = document.getElementById("bookCover").files[0];
    const pdfFile = document.getElementById("bookPDF").files[0];

    if (coverFile) {
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Uploading cover...';
      coverImageUrl = await uploadToCloudinary(coverFile, "books/covers");
    }

    if (pdfFile) {
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Uploading PDF...';
      pdfFileUrl = await uploadToCloudinary(pdfFile, "books/pdfs");
    }

    // Build JSON payload with Cloudinary URLs
    const bookData = {
      title: document.getElementById("bookTitle").value,
      author: document.getElementById("bookAuthor").value,
      genre: document.getElementById("bookGenre").value,
      description: document.getElementById("bookDescription").value,
    };

    // Only include file URLs if files were uploaded
    if (coverImageUrl) bookData.cover_image = coverImageUrl;
    if (pdfFileUrl) bookData.pdf_file = pdfFileUrl;

    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Saving book...';

    let url, method;
    const API_BASE_URL =
      window.API_CONFIG?.API_BASE_URL || "http://127.0.0.1:8000/api";

    if (currentEditBookId) {
      url = `${API_BASE_URL}/books/${currentEditBookId}/update/`;
      method = "PUT";
    } else {
      url = `${API_BASE_URL}/books/create/`;
      method = "POST";
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookData),
    });

    if (response.ok) {
      alert(
        currentEditBookId
          ? "Book updated successfully!"
          : "Book created successfully!",
      );
      closeModal();
      fetchBooks();
    } else {
      const data = await response.json();
      alert(JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error saving book:", error);
    alert("An error occurred while saving the book: " + error.message);
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
  }
}

// Close modal

function closeModal() {
  document.getElementById("bookModal").classList.remove("active");
  document.getElementById("bookForm").reset();
  currentEditBookId = null;
}

// Logout

function logout() {
  localStorage.clear();
  window.location.href = "./login.html";
}

// Initialize on page load

window.addEventListener("DOMContentLoaded", function () {
  // Check if user is authenticated and is admin
  const token = localStorage.getItem("noveliaToken");
  const userStr = localStorage.getItem("noveliaUser");

  if (!token) {
    alert("Please login as admin to access this page");
    window.location.href = "./login.html";
    return;
  }

  // Check if user is admin
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (!user.is_staff && !user.is_superuser) {
        alert("You do not have admin privileges");
        window.location.href = "../index.html";
        return;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }

  // Initialize tabs
  initTabs();

  // Load initial data (users tab is active by default)
  fetchUsers();

  // Add event listeners
  document
    .getElementById("addBookBtn")
    .addEventListener("click", openAddBookModal);
  document
    .getElementById("bookForm")
    .addEventListener("submit", submitBookForm);
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Close modal when clicking outside
  document.getElementById("bookModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });
});
