exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'C'est un POST qu'il faut !' };
  }

  try {
    const { menuData } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = 'brahimamgar54';
    const GITHUB_REPO = 'smash-burger';
    const GITHUB_PATH = 'menu.json';

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

    // 1. Récupérer le SHA (on utilise le fetch natif de Node 18+)
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });

    let sha = null;
    if (getRes.status === 200) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    }

    // 2. Préparer le contenu pour GitHub (Base64)
    const content = Buffer.from(JSON.stringify(menuData, null, 2)).toString('base64');

    // 3. Envoyer la mise à jour
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Mise à jour via interface admin',
        content: content,
        sha: sha || undefined // Si pas de sha, GitHub crée le fichier
      })
    });

    if (putRes.ok) {
      return { statusCode: 200, body: JSON.stringify({ message: "OK" }) };
    } else {
      const errorText = await putRes.text();
      return { statusCode: 500, body: JSON.stringify({ error: errorText }) };
    }

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
