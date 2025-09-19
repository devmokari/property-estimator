const API_URL =
  "https://g7eku3ruwr6e2hduscxavmi6zy0wsiel.lambda-url.ap-southeast-2.on.aws/";
const GEOAPIFY_KEY = "8fa427a20e3d4b73b081e0864e12c16c";

function setLoading(isLoading) {
  const btn = document.getElementById("searchBtn");
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
  }
}

// --- autocomplete ---
async function fetchSuggestions(query) {
  const box = document.getElementById("suggestions");
  box.innerHTML = "";
  if (query.length < 3) return;

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    query
  )}&apiKey=${GEOAPIFY_KEY}`;

  try {
    const data = await fetch(url).then((r) => r.json());
    data.features.forEach((f) => {
      const div = document.createElement("div");
      div.textContent = f.properties.formatted;
      div.onclick = () => {
        document.getElementById("addressInput").value = f.properties.formatted;
        box.innerHTML = "";
      };
      box.appendChild(div);
    });
  } catch (e) {
    console.log("autocomplete error", e);
  }
}

// --- property search ---
async function getEstimate() {
  const address = document.getElementById("addressInput").value.trim();
  if (!address) return alert("Please enter an address");

  setLoading(true);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const data = await res.json();

    const output = document.getElementById("output");
    const title = document.getElementById("propertyTitle");
    const details = document.getElementById("propertyDetails");
    const raw = document.getElementById("rawResponse");

    title.textContent = data.address || address || "Property Details";
    details.innerHTML = "";

    // --- Images ---
    if (Array.isArray(data.images) && data.images.length > 0) {
      const imgHtml = data.images
        .map((url) => `<img src="${url}" class="property-img"/>`)
        .join("");
      details.innerHTML += `<div class="image-gallery">${imgHtml}</div>`;
    }

    // --- Price range ---
    if (data.estimated_value_aud) {
      const est = new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
      }).format(data.estimated_value_aud);

      const low = data.price_lower_bound
        ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(data.price_lower_bound)
        : "—";

      const high = data.price_upper_bound
        ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(data.price_upper_bound)
        : "—";

      details.innerHTML += `
        <div class="detail-box price-box">
          <i class="fa-solid fa-dollar-sign"></i>
          <div>
            <strong>${low} – ${high}</strong><br>
            <small>Estimated: ${est}</small>
          </div>
        </div>`;
    }

    // --- Bedrooms ---
    if (data.bedrooms) {
      details.innerHTML += makeDetailBox("fa-bed", data.bedrooms);
    }

    // --- Bathrooms ---
    if (data.bathrooms) {
      details.innerHTML += makeDetailBox("fa-bath", data.bathrooms);
    }

    // --- Car spaces ---
    if (data.car_spaces) {
      details.innerHTML += makeDetailBox("fa-car", data.car_spaces);
    }

    // --- Lot size ---
    if (data.lot_size_m2) {
      details.innerHTML += makeDetailBox("fa-vector-square", `${data.lot_size_m2} m²`);
    }

    // --- Property type ---
    if (data.property_type) {
      details.innerHTML += makeDetailBox("fa-house", data.property_type);
    }

    // --- Council ---
    if (data.council) {
      details.innerHTML += makeDetailBox("fa-city", data.council);
    }

    // --- Internet ---
    if (data.internet) {
      details.innerHTML += makeDetailBox("fa-wifi", data.internet);
    }

    // --- Zoning schools ---
    if (Array.isArray(data.zoning_schools) && data.zoning_schools.length > 0) {
      const schoolList = data.zoning_schools.map((s) => `<li>${s}</li>`).join("");
      details.innerHTML += `
        <div class="detail-box">
          <i class="fa-solid fa-school"></i>
          <div>
            <ul class="school-list">${schoolList}</ul>
          </div>
        </div>`;
    }

    // --- Raw JSON ---
    raw.textContent = JSON.stringify(data, null, 2);
    output.style.display = "block";
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    setLoading(false);
  }
}

function makeDetailBox(icon, value) {
  return `
    <div class="detail-box">
      <i class="fa-solid ${icon}"></i>
      <div>${value}</div>
    </div>
  `;
}

function toggleRaw() {
  const raw = document.getElementById("rawResponse");
  raw.style.display = raw.style.display === "none" ? "block" : "none";
}
