// On n'utilise plus exports.handler, mais une fonction exportée par défaut
export default async function handler(req, res) {
  
  // 1. Vérification de la méthode (Vercel utilise req.method)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Utilisez la méthode POST" });
  }

  try {
    // 2. Récupération des données (Vercel parse le body automatiquement)
    const { menuData } = req.body; 
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = 'brahimamgar54';
    const GITHUB_REPO = 'smash-burger';
    const GITHUB_PATH = 'menu.json';

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

    // 3. Récupérer le SHA
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });

    let sha = null;
    if (getRes.status === 200) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    }

    // 4. Encoder en Base64
    const content = Buffer.from(JSON.stringify(menuData, null, 2)).toString('base64');

    // 5. Envoi vers GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Mise à jour via Vercel Admin',
        content: content,
        sha: sha || undefined 
      })
    });

    if (putRes.ok) {
      // Format de réponse Vercel
      return res.status(200).json({ message: "Sauvegarde réussie sur GitHub !" });
    } else {
      const errorData = await putRes.json();
      return res.status(putRes.status).json({ error: errorData.message });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
