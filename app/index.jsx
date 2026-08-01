<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LL OVEDBYUS STORE</title>
    <style>
        /* RESET & GENERAL STYLE */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            /* Background gambar bola disko */
            background-image: url('./background-image.jpg'); /* Pastikan nama file gambarmu sesuai */
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: #ffffff;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* OVERLAY GELAP & BLUR DI ATAS BACKGROUND */
        .bg-overlay {
            background: rgba(0, 0, 0, 0.45); /* Hitam transparan biar teks makin terbaca */
            backdrop-filter: blur(8px);        /* Efek buram pada gambar disko di belakang */
            -webkit-backdrop-filter: blur(8px);
            min-height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* NAVBAR */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px 50px;
        }

        .logo {
            font-weight: 900;
            font-style: italic;
            font-size: 1.2rem;
            letter-spacing: 1px;
        }

        nav a {
            color: #b3b3b3;
            text-decoration: none;
            margin-left: 30px;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: color 0.3s;
        }

        nav a:hover {
            color: #ffffff;
        }

        .btn-start-nav {
            background-color: #ffd1dc;
            color: #000;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.85rem;
            border: none;
            cursor: pointer;
        }

        /* HERO SECTION */
        .hero-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 40px 50px;
            flex-grow: 1;
        }

        .hero-content {
            max-width: 600px;
        }

        .studio-tag {
            font-size: 0.75rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #ff9ebb;
            margin-bottom: 15px;
            display: inline-block;
        }

        /* EFEK TEKS CHROME/GLOW (Sesuai style webmu) */
        h1 {
            font-size: 3.5rem;
            line-height: 1.1;
            font-weight: 900;
            font-style: italic;
            text-transform: uppercase;
            color: #f0f0f0;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
            margin-bottom: 20px;
        }

        .hero-content p {
            color: #cccccc;
            font-size: 0.95rem;
            margin-bottom: 30px;
            line-height: 1.5;
        }

        /* BUTTONS */
        .btn-group {
            display: flex;
            gap: 15px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #ffd1dc 0%, #ff9ebb 100%);
            color: #000;
            padding: 12px 28px;
            border-radius: 30px;
            font-weight: bold;
            text-decoration: none;
            font-size: 0.9rem;
            box-shadow: 0 0 15px rgba(255, 158, 187, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
            padding: 12px 28px;
            border-radius: 30px;
            font-weight: bold;
            text-decoration: none;
            font-size: 0.9rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* PREVIEW CONTAINER (Sisi Kanan) */
        .hero-preview {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 16px;
            backdrop-filter: blur(5px);
            width: 320px;
            height: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #777;
            font-size: 0.9rem;
        }

        /* RUNNING TEXT BAWAH */
        .marquee-container {
            background: rgba(0, 0, 0, 0.9);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 15px 0;
            overflow: hidden;
            white-space: nowrap;
        }

        .marquee-text {
            display: inline-block;
            animation: marquee 20s linear infinite;
            font-weight: 800;
            font-style: italic;
            font-size: 1.1rem;
            letter-spacing: 2px;
            color: #e0e0e0;
        }

        .marquee-text span {
            margin: 0 25px;
            color: #ff9ebb;
        }

        @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
        }
    </style>
</head>
<body>

    <div class="bg-overlay">
        <!-- NAVBAR -->
        <header>
            <div class="logo">LL OVEDBYUS <span style="font-weight: 300; font-size: 0.7rem; display: block;">STORE</span></div>
            <nav>
                <a href="#">Products</a>
                <a href="#">Official Links</a>
                <a href="#">About</a>
            </nav>
            <button class="btn-start-nav">START</button>
        </header>

        <!-- HERO SECTION -->
        <section class="hero-section">
            <div class="hero-content">
                <span class="studio-tag">+ LLOVEDBYUS STUDIO</span>
                <h1>CREATE SOMETHING THAT'S YOURS.</h1>
                <p>Design custom phone cases, sweatshirts, hoodies, t-shirts, tote bags, and more products the way you want.</p>
                
                <div class="btn-group">
                    <a href="#" class="btn-primary">START DESIGNING</a>
                    <a href="#" class="btn-secondary">EXPLORE PRODUCTS</a>
                </div>
            </div>

            <!-- PREVIEW GAMBAR PRODUK -->
            <div class="hero-preview">
                [Area Preview Produk / Mockup]
            </div>
        </section>

        <!-- RUNNING TEXT BERGERAK DI BAWAH -->
        <div class="marquee-container">
            <div class="marquee-text">
                DESIGN YOUR OWN STUFF <span>✦</span> DESIGN YOUR OWN STUFF <span>✦</span> DESIGN YOUR OWN STUFF <span>✦</span> DESIGN YOUR OWN STUFF <span>✦</span> DESIGN YOUR OWN STUFF <span>✦</span>
            </div>
        </div>
    </div>

</body>
</html>
