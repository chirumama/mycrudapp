const API_URL = "/api/items";

const cardContainer = document.getElementById("cardContainer");
const tagFilter = document.getElementById("tagFilter");
const itemForm = document.getElementById("itemForm");

let allItems = [];
let editingItemId = null;

const DEFAULT_IMAGE = "https://placehold.co/300x300?text=No+Image";
const DEFAULT_LINK = "https://google.com";

async function fetchItems() {
  const response = await fetch(API_URL);
  const items = await response.json();
  allItems = items;
  displayItems(items);
}

function displayItems(items) {
  cardContainer.innerHTML = "";
  items.forEach(item => {
    const imageUrl = item.image_url || DEFAULT_IMAGE;
    const link = item.link || DEFAULT_LINK;

    cardContainer.innerHTML += `
      <div class="card shadow-sm mb-3">
        <div class="d-flex align-items-stretch">
          <div class="card-image-wrapper">
            <img
              src="${imageUrl}"
              class="card-image"
              onerror="this.src='${DEFAULT_IMAGE}'"
            >
          </div>
          <div class="flex-grow-1 d-flex flex-column justify-content-between p-3">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="mb-1">${item.title}</h5>
                <p class="text-muted mb-3">${item.description}</p>
              </div>
              <span class="badge bg-light text-dark border">${item.tag}</span>
            </div>
            <div class="d-flex align-items-center gap-2 w-100 pt-2">
              <a href="${link}" target="_blank" class="btn btn-dark btn-sm flex-grow-1">
                <i class="bi bi-box-arrow-up-right me-1"></i>Visit
              </a>
              <button class="btn btn-dark btn-sm" onclick="editItem(${item.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-dark btn-sm" onclick="deleteItem(${item.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

function searchItems() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(searchValue) ||
    item.description.toLowerCase().includes(searchValue)
  );
  displayItems(filteredItems);
}

function filterItems() {
  const selectedTag = tagFilter.value;
  if (selectedTag === "All") {
    displayItems(allItems);
    return;
  }
  const filteredItems = allItems.filter(item => item.tag === selectedTag);
  displayItems(filteredItems);
}

function openNewItemModal() {
  editingItemId = null;
  itemForm.classList.remove('was-validated');
  itemForm.reset();

  const modal = new bootstrap.Modal(document.getElementById("itemModal"));
  modal.show();
}

function editItem(id) {
  const item = allItems.find(item => item.id === id);
  editingItemId = id;
  itemForm.classList.remove('was-validated');
  document.getElementById("title").value = item.title;
  document.getElementById("description").value = item.description;
  document.getElementById("tag").value = item.tag;
  document.getElementById("image_url").value = item.image_url || "";
  document.getElementById("link").value = item.link || "";

  const modal = new bootstrap.Modal(document.getElementById("itemModal"));
  modal.show();
}

function waitForModalHidden(modalEl) {
  return new Promise(resolve => {
    modalEl.addEventListener("hidden.bs.modal", resolve, { once: true });
  });
}

function restartSvgAnimations() {
  const svg = document.getElementById("confirmIcon");
  svg.querySelectorAll(".tick-circle-ring, .tick-check").forEach(el => {
    el.style.animation = "none";
    el.getBoundingClientRect();
    el.style.animation = "";
  });
}

function showConfirm(message) {
  return new Promise(resolve => {
    document.getElementById("confirmMessage").innerText = message;

    const overlay = document.getElementById("confirmOverlay");
    overlay.classList.add("active");
    restartSvgAnimations();

    let okClicked = false;
    let minTimePassed = false;

    const tryResolve = () => {
      if (okClicked && minTimePassed) {
        overlay.classList.remove("active");
        resolve();
      }
    };

    setTimeout(() => {
      minTimePassed = true;
      tryResolve();
    }, 2000);

    const btn = document.getElementById("confirmOkBtn");
    const handler = () => {
      btn.removeEventListener("click", handler);
      okClicked = true;
      tryResolve();
    };
    btn.addEventListener("click", handler);
  });
}

async function addItem(event) {
  event.preventDefault();
  event.stopPropagation();

  if (!itemForm.checkValidity()) {
    itemForm.classList.add('was-validated');
    return;
  }

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const tag = document.getElementById("tag").value;

  const item = {
    title,
    description,
    tag,
    image_url: document.getElementById("image_url").value || DEFAULT_IMAGE,
    link: document.getElementById("link").value || DEFAULT_LINK
  };

  const itemModalEl = document.getElementById("itemModal");
  const itemModal = bootstrap.Modal.getInstance(itemModalEl);
  itemModal.hide();
  await waitForModalHidden(itemModalEl);

  ["title", "description", "tag", "image_url", "link"].forEach(id => {
    document.getElementById(id).value = "";
  });

  if (editingItemId !== null) {
    await fetch(`${API_URL}/${editingItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    editingItemId = null;
    await showConfirm("Item updated successfully!");
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    await showConfirm("Item added successfully!");
  }

  fetchItems();
}

async function deleteItem(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  await showConfirm("Item deleted successfully!");
  fetchItems();
}



(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
fetchItems();