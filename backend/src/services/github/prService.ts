export const createFixPullRequest = async (incidentId: string, fixDetails: any) => {
  const token = process.env.GITHUB_TOKEN;
  const owner = 'Nik1510';
  const repo = 'ai-auto-healer';
  const fallbackUrl = `https://github.com/${owner}/${repo}/pulls`;
  
  if (!token || token === 'your_github_token_here' || token.trim() === '') {
    console.warn('[GitHub] Missing or invalid GITHUB_TOKEN. Returning fallback mock PR URL.');
    return {
      success: true,
      prUrl: fallbackUrl,
      isMock: true
    };
  }

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ai-auto-healer-backend'
  };

  try {
    const branchName = `fix/incident-${incidentId}-${Date.now()}`; // Add timestamp to avoid collisions
    
    // 1. Get SHA of main branch
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, { headers });
    if (!refRes.ok) throw new Error(`Failed to fetch main ref: ${refRes.statusText}`);
    const refData = await refRes.json();
    const sha = refData.object.sha;

    // 2. Create new branch
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha
      })
    });
    if (!createRefRes.ok) throw new Error(`Failed to create branch: ${createRefRes.statusText}`);

    // 3. Commit remediation file
    const content = Buffer.from(
      `# Remediation Plan for Incident ${incidentId}\n\n**Root Cause:**\n${fixDetails.rootCause}\n\n**Fix:**\n${fixDetails.fix}\n`
    ).toString('base64');

    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/remediation-${incidentId}.md`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Auto-healer: Remediation for incident ${incidentId}`,
        content,
        branch: branchName
      })
    });
    if (!commitRes.ok) throw new Error(`Failed to commit file: ${commitRes.statusText}`);

    // 4. Create Draft PR
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `🔧 Auto-Fix: Incident ${incidentId}`,
        body: `### AI Auto-Healer generated PR\n\n**Root Cause**: ${fixDetails.rootCause}\n\nThis PR includes a remediation script for the incident.`,
        head: branchName,
        base: 'main',
        draft: true
      })
    });
    if (!prRes.ok) {
      const errTxt = await prRes.text();
      throw new Error(`Failed to create PR: ${prRes.statusText} - ${errTxt}`);
    }
    const prData = await prRes.json();

    return {
      success: true,
      prUrl: prData.html_url,
      isMock: false
    };
  } catch (error) {
    console.error('[GitHub] Error creating PR:', error);
    return {
      success: true,
      prUrl: fallbackUrl,
      isMock: true
    };
  }
};
