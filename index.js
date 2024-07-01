const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.route("/upload")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload.html"));
  })
  .post(upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    console.log(`File uploaded to: ${req.file.path}`);
    res.send(`File uploaded successfully: ${req.file.path}`);
  });

app.route("/upload-multiple")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
  })
  .post(upload.array("files", 15), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    const filePaths = req.files.map((file) => file.path);
    console.log(`Files uploaded to: ${filePaths.join(", ")}`);
    res.status(200).send(`Files uploaded successfully: ${filePaths.join(", ")}`);
  });

app.get("/fetch-single", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");
  let uploads = fs.readdirSync(upload_dir);
  console.log(uploads);
  if (uploads.length == 0) {
    return res.status(503).send({ message: "No images" });
  }
  let max = uploads.length - 1;
  let min = 0;
  let index = Math.round(Math.random() * (max - min) + min);
  let randomImage = uploads[index];
  res.sendFile(path.join(upload_dir, randomImage));
});

app.get("/single", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "single.html"));
});

app.get('/fetch-multiple-images', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          console.error('Error reading directory:', err);
          return res.status(500).send('Error reading directory');
      }
      if (files.length === 0) {
          return res.status(503).send({ message: 'No Images Found' });
      }
      let count = Math.min(req.query.count || 5, files.length);
      let randomImages = [];
      while (randomImages.length < count) {
          let index = Math.floor(Math.random() * files.length);
          let selectedImage = files.splice(index, 1)[0];
          randomImages.push(selectedImage);
      }
      console.log("multipleImgaes",(randomImages));
      res.json(randomImages);
  });
});

app.get("/multiple", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "multiple.html"));
});

app.get('/fetch-all', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }
    if (files.length === 0) {
      return res.status(503).send({ message: 'No Images Found' });
    }
    res.json(files);
  });
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gallery.html'));
});

app.get('/fetch-all/pages/:index', (req, res) => {
  const ITEMS_PER_PAGE = parseInt(req.query.items_per_page, 10) || 5;
  const pageIndex = parseInt(req.params.index, 10);

  console.log('Page Index:', pageIndex);
  console.log('Items Per Page:', ITEMS_PER_PAGE);

  if (isNaN(pageIndex) || pageIndex < 1) {
    console.error('Invalid page index:', pageIndex);
    return res.status(400).send('Invalid page index.');
  }

  const allFiles = fs.readdirSync(path.join(__dirname, 'uploads'));
  console.log('All Files:', allFiles);

  const totalItems = allFiles.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  console.log('Total Items:', totalItems);
  console.log('Total Pages:', totalPages);

  if (pageIndex > totalPages) {
    console.error('Page not found:', pageIndex);
    return res.status(404).send('Page not found.');
  }

  const startIndex = (pageIndex - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const pageItems = allFiles.slice(startIndex, endIndex);

  console.log('Page Items:', pageItems);

  const response = {
    page: pageIndex,
    totalPages: totalPages,
    files: pageItems,
  };

  res.json(response);
});


app.get('/gallery-pagination', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gallery_pagination.html'));
});

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
