const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

const SENDER_EMAIL = 'jdey09957@gmail.com';
const SENDER_APP_PASSWORD = PASSWORD;

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }
});

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDER_EMAIL, 
        pass: SENDER_APP_PASSWORD
    }
});

// Category-Strict Store Mapping
const storeConfig = [
    { name: "Amazon", categories: ["garments", "electronic", "makeup"], getLink: (q) => `https://www.amazon.in/s?k=${q}` },
    { name: "Flipkart", categories: ["garments", "electronic", "makeup"], getLink: (q) => `https://www.flipkart.com/search?q=${q}` },
    { name: "Meesho", categories: ["garments", "electronic", "makeup"], getLink: (q) => `https://www.meesho.com/search?q=${q}` },
    { name: "AJIO", categories: ["garments"], getLink: (q) => `https://www.ajio.com/search/?text=${q}` },
    { name: "Myntra", categories: ["garments"], getLink: (q) => `https://www.myntra.com/search?rawQuery=${q}` },
    { name: "H & M", categories: ["garments"], getLink: (q) => `https://www2.hm.com/en_in/search-results.html?q=${q}` },
    { name: "Nykaa", categories: ["makeup"], getLink: (q) => `https://www.nykaa.com/search/result/?q=${q}` },
    { name: "Purplle", categories: ["makeup"], getLink: (q) => `https://www.purplle.com/search?q=${q}` },
    { name: "Croma", categories: ["electronic"], getLink: (q) => `https://www.croma.com/searchB?q=${q}` },
    { name: "Reliance Digital", categories: ["electronic"], getLink: (q) => `https://www.reliancedigital.in/search?q=${q}` }
];

const catalogKeywords = [
    "shirt", "tshirt", "makeup", "lipstick", "cosmetics", "laptop", 
    "refrigerator", "mobile", "headphone", "shoes", "watch", "garments", "electronic"
];

function getLevenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

const mockProductsDB = {
    garments: [
        { title: "Campus Sutra Slim Fit Casual Checked Shirt", minPrice: 599, maxPrice: 1199, image: "https://www.beyours.in/cdn/shop/files/iron-grey-flatlay_30b8de6f-065b-4a25-8be1-b55890255182.jpg?v=1789546090" },
        { title: "Roadster White Linen Solid Casual Shirt", minPrice: 799, maxPrice: 1099, image: "https://bananaclub.co.in/cdn/shop/files/1_3_82a13e8d-40ae-44ee-9d10-c3022f6496d9.jpg?v=1740117235" },
        { title: "Highlander Classic Flannel Cotton Shirt", minPrice: 699, maxPrice: 1099, image: "https://cahoot.in/cdn/shop/files/CSMSSRT7738_1_3b3a4a5e-5da6-48a2-9bb3-c4bfdbe43f3f.jpg?v=1731147468&width=500" },
        { title: "Levi's Rugged Denim Casual Long Sleeve Shirt", minPrice: 1299, maxPrice: 2999, image: "https://www.pepejeans.in/on/demandware.static/-/Sites-masterCatalog_Pepe/default/dw0cd8bc91/tops/8905875711032-18.jpg" },
        { title: "Puma Urban Oversized Graphic Printed T-Shirt", minPrice: 499, maxPrice: 999, image: "https://saimfashion.com/cdn/shop/files/rn-image_picker_lib_temp_0661abfc-0544-46c2-8c14-9c842a87b7fc.png?v=1779178490" },
        { title: "Jack & Jones Premium Solid Polo T-Shirt", minPrice: 849, maxPrice: 1549, image: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&auto=format&fit=crop&q=80" },
        { title: "U.S. Polo Assn. Men Striped Regular Shirt", minPrice: 999, maxPrice: 2999, image: "https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4mss4157-02_1.jpg?v=1759819703&quality=80" },
        { title: "Wrangler Slim Denim Indigo Shirt", minPrice: 399, maxPrice: 899, image: "https://frenchcrown.com/cdn/shop/collections/Formal_Shirts.png?v=1775121805&width=2048" },
        { title: "U.S. Polo Assn. Men Striped Regular Shirt", minPrice: 1099, maxPrice: 1499, image: "https://rukmini1.flixcart.com/image/1500/1500/xif0q/shirt/d/z/o/xl-jio-casual-shirt-webric-original-imahdkbnxyehyuj2.jpeg?q=70" },
        { title: "Roadster White Linen Solid Casual Shirt", minPrice: 899, maxPrice: 1199, image: "https://www.pepejeans.in/on/demandware.static/-/Sites-masterCatalog_Pepe/default/dw0cd8bc91/tops/8905875711032-18.jpg" }
    ],
    lipstick: [
        { title: "MAC Matte Lipstick - Retro Ruby Red Shade", minPrice: 990, maxPrice: 1750, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ58TnJ86YjN2k9JqFjcfb6duLoueXCf18Rg8DEv-OuApydFSRnTkj1WUyH&s=10" },
        { title: "Maybelline Superstay Matte Ink Liquid Lipstick", minPrice: 399, maxPrice: 650, image: "https://swissbeauty.in/cdn/shop/files/SB-S6_201RussianRed_dc5c3663-8473-45f4-a950-ace08d5e6327.jpg?v=1748634874&width=620" },
        { title: "Lakme Absolute Matte Melt Lip Color - Deep Berry", minPrice: 349, maxPrice: 599, image: "https://www.reneecosmetics.in/cdn/shop/files/Vintage_Rose.jpg?v=1776320597&width=1946" },
        { title: "SUGAR Smudge Me Not Liquid Lipstick - Bold Plum", minPrice: 299, maxPrice: 499, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxRF9RHel77DTTNEA7R7VPj1AyXd6cAEP1jT_OaLnuwPzOGTC_C4L3apxq&s=10" },
        { title: "L'Oreal Paris Color Riche Intense Volume Matte Lipstick", minPrice: 549, maxPrice: 899, image: "https://assets.myntassets.com/w_412,q_50,,dpr_3,fl_progressive,f_webp/assets/images/24957706/2024/7/22/3f3fd6d5-cddb-46ed-8a2d-beb820c44b6f1721622361529-LOreal-Paris-Infallible-Matte-Resistance-Liquid-Lipstick-5ml-1.jpg" },
        { title: "NYX Professional Velvet Matte Lip Crayon", minPrice: 449, maxPrice: 699, image: "https://assets.myntassets.com/h_1440,q_75,w_1080/v1/assets/images/30850956/2025/6/15/eace3c63-474d-4cbf-9cb4-3b086d645f391749978818692-Beauty-People-Glorified-Gold-Creamy-Matte-Lipstick---38g---R-1.jpg" },
        { title: "Faces Canada Comfy Matte Liquid Lipstick", minPrice: 279, maxPrice: 450, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl1vzcqOPxT0Ah_gakj4FZmtkCvtAaoAOJ2LZKFinupoaItOCPKXN8jRDO&s=10" }
    ],
    makeup: [
        { title: "MAC Matte Lipstick - Retro Ruby Red Shade", minPrice: 990, maxPrice: 1750, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80" },
        { title: "Maybelline Superstay Matte Ink Liquid Lipstick", minPrice: 399, maxPrice: 650, image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=500&auto=format&fit=crop&q=80" },
        { title: "Fit Me Matte Liquid Foundation Natural Shade", minPrice: 329, maxPrice: 599, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80" },
        { title: "L'Oreal Waterproof Volumizing Mascara", minPrice: 499, maxPrice: 799, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80" }
    ],
    laptop: [
        { title: "Apple MacBook Air M2 (8GB RAM / 256GB SSD)", minPrice: 84990, maxPrice: 92990, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80" },
        { title: "Dell XPS 13 Intel Core i7 Ultra Thin Laptop", minPrice: 72990, maxPrice: 81990, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80" },
        { title: "ASUS ROG Strix Gaming Laptop RTX 4060", minPrice: 64990, maxPrice: 74990, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80" },
        { title: "Lenovo ThinkPad E14 Intel Core i5 12th Gen", minPrice: 48990, maxPrice: 56990, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&auto=format&fit=crop&q=80" },
        { title: "HP Pavilion 15 Thin & Light Full HD Laptop", minPrice: 42990, maxPrice: 49990, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80" },
        { title: "Acer Aspire 5 Intel Core i3 11th Gen Laptop", minPrice: 31990, maxPrice: 36990, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=80" }
    ],
    electronic: [
        { title: "Apple MacBook Air M2 (8GB RAM / 256GB SSD)", minPrice: 84990, maxPrice: 92990, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80" },
        { title: "Dell XPS 13 Intel Core i7 Ultra Thin Laptop", minPrice: 72990, maxPrice: 81990, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80" },
        { title: "Sony WH-1000XM5 Noise Cancelling Headphones", minPrice: 22990, maxPrice: 26990, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" },
        { title: "Samsung Galaxy Tab S8 Ultra AMOLED Display", minPrice: 54990, maxPrice: 62990, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80" }
    ]
};

let usersDB = {}; 
let otpDB = {};

// SEND OTP API
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Please provide a valid email address." });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpDB[email] = generatedOtp;

    const mailOptions = {
        from: `"All In One Shopping Hub" <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Your Account Verification OTP - AIO Shopping Hub',
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #080b11; color: #ffffff; padding: 30px; border-radius: 16px; border: 1.5px solid #ff9900; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ff9900; margin: 0; font-size: 26px; font-weight: 800;">AIO Shopping Hub</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 5px;">Smart Multi-Store Shopping Aggregator</p>
            </div>
            <div style="background: rgba(18, 24, 36, 0.9); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,153,0,0.3);">
                <p style="font-size: 15px; color: #e2e8f0; margin-top: 0;">Hello User,</p>
                <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">Thank you for registering with All In One Shopping Hub! Please use the following 6-digit verification code to complete your account setup:</p>
                
                <div style="text-align: center; background: rgba(255, 153, 0, 0.15); border: 1.5px dashed #ff9900; padding: 15px; border-radius: 10px; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: 800; color: #ff9900; letter-spacing: 6px;">${generatedOtp}</span>
                </div>
                <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">This OTP is confidential and valid for account verification only. Please do not share this code with anyone.</p>
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 25px;">&copy; 2026 All In One Shopping Platform. All rights reserved.</p>
        </div>
        `
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        res.json({ success: true, message: `Verification OTP sent to ${email}` });
    } catch (err) {
        res.status(500).json({ success: false, message: "OTP mail send error." });
    }
});

// SIGNUP API WITH WELCOME EMAIL
app.post('/api/signup', upload.single('profilePic'), async (req, res) => {
    const { name, email, phone, dob, password, otp } = req.body;
    if (usersDB[email]) return res.status(400).json({ success: false, message: "Email already registered!" });
    if (!otp || otpDB[email] !== otp) return res.status(400).json({ success: false, message: "Invalid OTP!" });

    let calculatedAge = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : "N/A";
    let profilePicUrl = req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    delete otpDB[email];
    usersDB[email] = { name, email, phone, dob, age: calculatedAge, pic: profilePicUrl, password, history: [] };

    // Send Welcome / Thank You Email
    const welcomeMailOptions = {
        from: `"All In One Shopping Hub" <${SENDER_EMAIL}>`,
        to: email,
        subject: 'Welcome to All In One Shopping Hub! 🎉',
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #080b11; color: #ffffff; padding: 30px; border-radius: 16px; border: 1.5px solid #ff9900; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ff9900; margin: 0; font-size: 26px; font-weight: 800;">Welcome, ${name}! 🎉</h1>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 5px;">Your Account Has Been Created Successfully</p>
            </div>
            <div style="background: rgba(18, 24, 36, 0.9); padding: 22px; border-radius: 12px; border: 1px solid rgba(255,153,0,0.3);">
                <p style="font-size: 15px; color: #e2e8f0; margin-top: 0;">Thank you for joining <strong>All In One Shopping Hub</strong>!</p>
                <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">You can now seamlessly search, compare prices, and uncover the best live deals across top marketplaces like Amazon, Flipkart, Myntra, Nykaa, and Croma in one unified view.</p>
                <div style="text-align: center; margin: 25px 0 10px;">
                    <a href="http://localhost:5000" style="background: linear-gradient(45deg, #ff9900, #ff5e62); color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: 700; font-size: 14px; border-radius: 25px; display: inline-block;">Start Finding Best Deals</a>
                </div>
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 25px;">&copy; 2026 All In One Shopping Platform. Designed & Developed by Joy Deep Dey.</p>
        </div>
        `
    };

    emailTransporter.sendMail(welcomeMailOptions).catch(err => console.log("Welcome Mail Error:", err));

    res.json({ success: true, message: "Account created successfully!", user: usersDB[email] });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersDB[email];
    if (user && user.password === password) res.json({ success: true, message: "Login successful!", user: user });
    else res.status(400).json({ success: false, message: "Invalid Credentials!" });
});

app.post('/api/logout', (req, res) => {
    const { email } = req.body;
    if (usersDB[email]) delete usersDB[email];
    res.json({ success: true });
});

app.post('/api/history', (req, res) => {
    const { email, query } = req.body;
    if (email && usersDB[email] && query && !usersDB[email].history.includes(query)) {
        usersDB[email].history.unshift(query);
    }
    res.json({ success: true });
});

// SEARCH API
app.get('/api/search', async (req, res) => {
    const { query, category } = req.query;
    let results = [];
    let correctedQuery = null;

    let rawSearchTerm = (query || '').toLowerCase().trim();

    if (rawSearchTerm.length > 2) {
        let minDistance = 999;
        let bestMatch = rawSearchTerm;

        catalogKeywords.forEach(keyword => {
            const dist = getLevenshteinDistance(rawSearchTerm, keyword);
            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = keyword;
            }
        });

        if (minDistance > 0 && minDistance <= 2) {
            correctedQuery = bestMatch;
            rawSearchTerm = correctedQuery;
        }
    }

    let detectedCategory = category && category !== 'all' ? category : 'all';
    let subType = null;

    if (/(lipstick|lip|lips|lipcolor|lipshade)/i.test(rawSearchTerm)) {
        detectedCategory = 'makeup';
        subType = 'lipstick';
    } else if (/(laptop|laptops|computer|pc|macbook|ultrabook)/i.test(rawSearchTerm)) {
        detectedCategory = 'electronic';
        subType = 'laptop';
    } else if (/(makeup|cosmetic|cosmetics|beauty|foundation|mascara|eyeshadow)/i.test(rawSearchTerm)) {
        detectedCategory = 'makeup';
    } else if (/(laptop|electronic|electronics|phone|mobile|watch|headphone)/i.test(rawSearchTerm)) {
        detectedCategory = 'electronic';
    } else if (/(shirt|garment|garments|cloth|clothes|dress|pant|pants|tshirt)/i.test(rawSearchTerm)) {
        detectedCategory = 'garments';
    } else if (detectedCategory === 'all') {
        detectedCategory = 'garments';
    }

    const poolKey = subType || detectedCategory;
    const itemsPool = mockProductsDB[poolKey] || mockProductsDB[detectedCategory] || mockProductsDB.garments;
    
    let validStores = storeConfig.filter(s => s.categories.includes(detectedCategory));

    validStores.forEach((store, storeIndex) => {
        const count = 3; 
        for (let i = 0; i < count; i++) {
            const itemIndex = (storeIndex + i * 2) % itemsPool.length;
            const item = itemsPool[itemIndex];
            const priceOffset = (storeIndex * 35) + (i * 55);
            let finalPrice = Math.floor(item.minPrice + priceOffset);
            if (finalPrice > item.maxPrice) finalPrice = item.maxPrice;

            const displayTitle = `${item.title} (${store.name} Offer)`;

            results.push({
                id: Date.now() + storeIndex * 100 + i,
                title: displayTitle,
                store: store.name,
                category: detectedCategory,
                price: finalPrice,
                rating: (4.1 + ((storeIndex + i) % 8) * 0.1).toFixed(1),
                image: item.image,
                link: store.getLink(encodeURIComponent(item.title))
            });
        }
    });

    return res.json({ 
        success: true, 
        count: results.length, 
        didYouMean: correctedQuery, 
        products: results 
    });
});

// IMAGE SEARCH API
app.post('/api/search/image', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err || !req.file) return res.status(400).json({ success: false, message: "Image upload failed" });
        
        let results = [];
        const uploadedImageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        const basePrice = 599;

        storeConfig.forEach((store, index) => {
            if (store.categories.includes('garments')) {
                const storePrice = basePrice + (index * 60) - ((index % 2) * 30);
                results.push({
                    id: Date.now() + index,
                    title: `Visual Match Product on ${store.name}`,
                    store: store.name,
                    category: "garments",
                    price: storePrice,
                    rating: (4.2 + (index % 5) * 0.1).toFixed(1),
                    image: uploadedImageUrl,
                    link: store.getLink("casual shirt") 
                });
            }
        });

        res.json({ success: true, uploadedFile: req.file.filename, products: results });
    });
});

app.listen(PORT, () => {
    console.log(`AIO Shopping Hub Backend Running on Port: ${PORT}`);
});