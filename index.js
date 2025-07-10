#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const server = new McpServer({
    name: "project-planner",
    version: "1.0.0",
});

const inputSchema = {
    query: z.string().describe("A project idea like 'portfolio', 'ai chatbot', or 'weather app'.")
};

async function fetchReposFromGitHub(query) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+starter+in:name&sort=stars&order=desc&per_page=3`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.items.map(repo => `${repo.full_name} - ${repo.html_url}`);
}

async function handleQuery({query}) {
    const repos = await fetchReposFromGitHub(query);
    if (repos.length > 0) {
        return {
            content:[
                { type:"text", text: `Top GitHub repos for '${query}':\n\n${repos.join("\n")}` }
            ]
        };
    }
    return {
        content:[
            { type: "text", text: `No GitHub results found for '${query}'. Try a more general word like 'portfolio' or 'todo app'.` }
        ]
    };
}

server.registerTool("planner", {
    title: "Project Planner",
    description: "Suggests GitHub starter templates based on project ideas using public GitHub search.",
    inputSchema
}, handleQuery);

const transport = new StdioServerTransport();
await server.connect(transport);
