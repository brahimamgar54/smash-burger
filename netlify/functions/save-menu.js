```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { menuData } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = 'brahimamgar54';
    const GITHUB_REPO = 'smash-burger';
    const GITHUB_PATH = 'menu.json';

    // Récupérer le SHA actuel
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    let sha = null;
    const getResponse = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if (getResponse.ok) {
      const fileInfo = await getResponse.json();
      sha = fileInfo.sha;
    }

    const content = Buffer.from(JSON.stringify(menuData, null, 2)).toString('base64');

    const body = {
      message: 'Mise à jour du menu via admin',
      content: content,
      ...(sha && { sha })
    };

    const putResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseData = await putResponse.json();

    if (putResponse.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Sauvegarde réussie' })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: responseData.message })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```
