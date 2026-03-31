const axios = require('axios');

/**
 * GitHub Service for Plagiarism Detection
 * Checks repo metadata, history, and duplicates.
 */
class GitHubService {
    constructor() {
        this.token = process.env.GITHUB_TOKEN;
        this.headers = this.token ? { 'Authorization': `token ${this.token}` } : {};
    }

    /**
     * Extracts owner and repo name from a GitHub URL
     */
    parseUrl(url) {
        try {
            const regex = /github\.com\/([^/]+)\/([^/]+)/;
            const match = url.replace(/\.git$/, '').match(regex);
            if (!match) return null;
            return { owner: match[1], repo: match[2] };
        } catch (e) {
            return null;
        }
    }

    /**
     * Fetches repo metadata
     */
    async getRepoData(owner, repo) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.error(`GH Metadata Fetch Error (${owner}/${repo}):`, error.message);
            return null;
        }
    }

    /**
     * Fetches commit statistics
     */
    async getCommitStats(owner, repo) {
        try {
            // Get last 100 commits
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers: this.headers });
            return response.data;
        } catch (error) {
            console.error(`GH Commit Fetch Error (${owner}/${repo}):`, error.message);
            return [];
        }
    }

    /**
     * Runs plagiarism analysis on a single repo
     */
    async analyzeRepo(githubLink, hackathonStartDate) {
        const parsed = this.parseUrl(githubLink);
        if (!parsed) return { isPlagiarized: true, reason: 'Invalid GitHub URL format', score: 100 };

        const { owner, repo } = parsed;
        const repoData = await this.getRepoData(owner, repo);
        if (!repoData) return { isPlagiarized: true, reason: 'Repository not found or private', score: 100 };

        const commits = await this.getCommitStats(owner, repo);

        let score = 0;
        let reasons = [];

        // 1. Check creation date
        const createdAt = new Date(repoData.created_at);
        const hackStarDate = new Date(hackathonStartDate);

        // If repo was created more than 2 days before hackathon, flag it
        const twoDaysBefore = new Date(hackStarDate.getTime() - (2 * 24 * 60 * 60 * 1000));
        if (createdAt < twoDaysBefore) {
            score += 60;
            reasons.push(`Repo created on ${createdAt.toLocaleDateString()}, which is before hackathon start.`);
        }

        // 2. Check commit history
        if (commits.length > 0) {
            const firstCommitDate = new Date(commits[commits.length - 1].commit.author.date);
            if (firstCommitDate < twoDaysBefore) {
                score += 30;
                reasons.push(`First commit found on ${firstCommitDate.toLocaleDateString()}, suggesting older work.`);
            }

            // check for suspicious commit bursts (e.g. 50 commits and 1 author)
            const authors = new Set(commits.map(c => c.author?.login || 'unknown'));
            if (authors.size === 1 && commits.length > 20) {
                // Not necessarily plagiarism, but worth noting if combine with old date
            }
        }

        // 3. Template/Fork check
        if (repoData.fork) {
            score += 20;
            reasons.push('This repository is a fork.');
        }

        return {
            isPlagiarized: score >= 50,
            score: Math.min(score, 100),
            reason: reasons.join(' '),
            details: {
                repoName: repoData.full_name,
                createdAt: repoData.created_at,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                commitsAnalyzed: commits.length
            }
        };
    }
}

module.exports = new GitHubService();
