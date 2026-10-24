import "dotenv/config";
import mongoose from "mongoose";
import Course from "./models/Course.js";
import Lesson from "./models/Lesson.js";

const courseSlug = "introduction-to-html-free";

const lessons = [
  {
    title: "Introduction to HTML",
    slug: "introduction-to-html",
    description: "HTML ka introduction aur web pages mein iska role.",
    order: 1,
    content: `# Introduction to HTML

HTML ka full form HyperText Markup Language hai. Iska use web pages ka structure banane ke liye hota hai.

## HTML kya karta hai?

HTML browser ko batata hai ki webpage par headings, paragraphs, images aur links jaise elements kaise organize hone chahiye.

HTML programming language nahi, balki markup language hai.

## Example

\`\`\`html
<h1>Hello World</h1>
<p>This is my first webpage.</p>
\`\`\`

## Key points

- HTML webpage ka structure banata hai.
- HTML elements tags se define hote hain.
- Browser HTML document ko render karke webpage dikhata hai.

## Practice

Ek notebook mein likhiye ki HTML ka full form kya hai aur iska use kis liye hota hai.`,
  },
  {
    title: "HTML Document Structure",
    slug: "html-document-structure",
    description: "HTML document ke basic tags ko samjhein.",
    order: 2,
    content: `# HTML Document Structure

Har basic HTML page mein ek standard structure hota hai.

## Example

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>This is my webpage.</p>
</body>
</html>
\`\`\`

## Important tags

- \`<!DOCTYPE html>\`: HTML5 document declare karta hai.
- \`<html>\`: HTML document ka root element hai.
- \`<head>\`: Metadata aur page title rakhta hai.
- \`<title>\`: Browser tab ka title set karta hai.
- \`<body>\`: Page par dikhne wala content rakhta hai.

## Practice

Ek HTML file banayein jiska title "My First Page" ho aur body mein ek heading ho.`,
  },
  {
    title: "Headings and Paragraphs",
    slug: "html-headings-and-paragraphs",
    description: "Headings aur paragraphs ke through content organize karein.",
    order: 3,
    content: `# Headings and Paragraphs

HTML mein headings aur paragraphs content ko readable banate hain.

## Headings

HTML mein six heading levels hote hain: \`<h1>\` se \`<h6>\` tak.

\`\`\`html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
\`\`\`

\`<h1>\` sabse important heading level hai aur \`<h6>\` sabse lower level hai.

## Paragraphs

Paragraph likhne ke liye \`<p>\` tag use hota hai.

\`\`\`html
<p>HTML is used to structure web content.</p>
\`\`\`

## Practice

Ek page banayein jisme ek main heading, do subheadings aur do paragraphs hon.`,
  },
  {
    title: "Links and Images",
    slug: "html-links-and-images",
    description: "Web pages mein hyperlinks aur images add karna seekhein.",
    order: 4,
    content: `# Links and Images

HTML links ke through users ek page se doosre page par ja sakte hain. Images webpage ko visual content deti hain.

## Link example

\`\`\`html
<a href="https://example.com">Visit Example</a>
\`\`\`

Anchor tag \`<a>\` link banata hai. \`href\` attribute destination batata hai.

## Image example

\`\`\`html
<img src="photo.jpg" alt="A sample photo">
\`\`\`

- \`src\` image ka path batata hai.
- \`alt\` image ka text alternative deta hai.

## Best practice

Meaningful \`alt\` text likhein, taaki accessibility aur image understanding improve ho.

## Practice

Ek webpage banayein jisme ek external link aur ek image ho.`,
  },
  {
    title: "Lists in HTML",
    slug: "html-lists",
    description: "Ordered aur unordered lists banana seekhein.",
    order: 5,
    content: `# Lists in HTML

HTML mein items ko list ke form mein organize kiya ja sakta hai.

## Unordered list

Bullets ke saath list banane ke liye \`<ul>\` use hota hai.

\`\`\`html
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
\`\`\`

## Ordered list

Numbered list banane ke liye \`<ol>\` use hota hai.

\`\`\`html
<ol>
  <li>Learn HTML</li>
  <li>Learn CSS</li>
  <li>Learn JavaScript</li>
</ol>
\`\`\`

Har list item ko \`<li>\` tag ke andar likha jata hai.

## Practice

Apne favourite subjects ki unordered list aur daily routine ki ordered list banayein.`,
  },
  {
    title: "Build Your First HTML Page",
    slug: "build-your-first-html-page",
    description: "Seekhe gaye HTML concepts ko ek simple webpage mein use karein.",
    order: 6,
    content: `# Build Your First HTML Page

Ab ek simple webpage banayein jo headings, paragraphs, link aur list ka use karta ho.

## Complete example

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Me</title>
</head>
<body>
  <h1>About Me</h1>

  <p>Hello! I am learning HTML.</p>

  <h2>My Learning Goals</h2>
  <ul>
    <li>Learn HTML</li>
    <li>Learn CSS</li>
    <li>Build websites</li>
  </ul>

  <p>
    <a href="https://developer.mozilla.org/">Learn more about web development</a>
  </p>
</body>
</html>
\`\`\`

## Your assignment

1. Apna HTML document banayein.
2. Apna naam aur introduction add karein.
3. Kam se kam ek heading aur do paragraphs likhein.
4. Ek list aur ek link add karein.
5. File ko browser mein open karke output check karein.

Congratulations! Aapne HTML ke basic concepts cover kar liye.`,
  },
];

async function seedLessons() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI environment variable missing hai. Apni server .env configuration check karein.",
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected.");

  const course = await Course.findOne({ slug: courseSlug }).select(
    "_id title slug status",
  );

  if (!course) {
    throw new Error(
      `Course "${courseSlug}" nahi mila. Pehle course create karein.`,
    );
  }

  if (course.status !== "published") {
    throw new Error(
      `Course "${courseSlug}" published nahi hai. Pehle publish karein.`,
    );
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const lessonData of lessons) {
    const existing = await Lesson.findOne({
      course: course._id,
      slug: lessonData.slug,
    }).select("_id");

    await Lesson.findOneAndUpdate(
      {
        course: course._id,
        slug: lessonData.slug,
      },
      {
        $set: {
          ...lessonData,
          course: course._id,
          status: "published",
        },
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (existing) {
      updatedCount++;
    } else {
      createdCount++;
    }
  }

  console.log(`Course: ${course.title}`);
  console.log(`Lessons created: ${createdCount}`);
  console.log(`Lessons updated: ${updatedCount}`);
  console.log(`Total lessons in seed: ${lessons.length}`);
}

seedLessons()
  .catch((error: unknown) => {
    console.error("Lesson seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
