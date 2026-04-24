#!/usr/bin/env node

const { Octokit } = require("@octokit/rest");

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const developerUsername = process.env.DEVELOPER_USERNAME;
const taskCompleted = process.env.TASK_COMPLETED;

async function updateOnboardingProgress() {
  try {
    console.log(`Updating onboarding progress for ${developerUsername}...`);

    // Find the developer's summary issue
    const summaryIssues = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: "onboarding-summary",
      state: "open",
    });

    const developerSummary = summaryIssues.data.find((issue) =>
      issue.title.includes(developerUsername)
    );

    if (!developerSummary) {
      console.log("No summary issue found for developer");
      return;
    }

    // Get all onboarding tasks for this developer
    const onboardingTasks = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: "onboarding-task",
      state: "all",
      assignee: developerUsername,
    });

    // Count completed tasks
    const completedTasks = onboardingTasks.data.filter(
      (task) => task.state === "closed"
    );
    const totalTasks = onboardingTasks.data.length;
    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

    // Determine current phase
    let currentPhase = "Phase 1";
    if (completedTasks.length >= 2) {
      currentPhase = "Phase 2";
    }
    if (completedTasks.length >= 4) {
      currentPhase = "Phase 3";
    }

    // Update the summary issue
    const updatedBody = `## 🎯 Onboarding Progress Tracker

Welcome @${developerUsername}! Here's your personalized onboarding journey.

### 📋 Tasks Created:
${onboardingTasks.data
  .map((task, index) => {
    const status = task.state === "closed" ? "✅" : "⏳";
    return `- ${status} ${task.title}`;
  })
  .join("\n")}

### 📊 Progress:
- **Phase 1 (Environment)**: ${
      completedTasks.filter((t) => t.milestone?.title === "Onboarding Phase 1")
        .length
    }/2 tasks completed
- **Phase 2 (Learning)**: ${
      completedTasks.filter((t) => t.milestone?.title === "Onboarding Phase 2")
        .length
    }/2 tasks completed  
- **Phase 3 (Completion)**: ${
      completedTasks.filter((t) => t.milestone?.title === "Onboarding Phase 3")
        .length
    }/1 tasks completed

### 🎯 Current Status:
- **Completion Rate**: ${completionRate}%
- **Current Phase**: ${currentPhase}
- **Tasks Completed**: ${completedTasks.length}/${totalTasks}

### 🏆 Recent Achievement:
${taskCompleted ? `✅ **Just completed**: ${taskCompleted}` : ""}

### 🎯 Next Steps:
${
  completedTasks.length === 0
    ? '1. Start with "Set up local development environment"'
    : ""
}
${
  completedTasks.length === 1
    ? '2. Move on to "Understand the codebase structure"'
    : ""
}
${completedTasks.length === 2 ? '3. Begin "Make your first contribution"' : ""}
${completedTasks.length === 3 ? '4. Learn the "AI agent framework"' : ""}
${completedTasks.length === 4 ? '5. Complete the "onboarding survey"' : ""}
${
  completedTasks.length >= 5
    ? "🎉 **Congratulations! Onboarding complete!**"
    : ""
}

### 🤖 AI Assistant:
I'm here to help! Ask me about:
- Code explanations
- Implementation guidance
- Best practices
- Troubleshooting

### 👥 Your Mentor:
Your mentor will help guide you through the process and review your contributions.

${
  completionRate >= 100
    ? "🎉 **Onboarding Complete!** Welcome to the team!"
    : "Keep up the great work! 🚀"
}`;

    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: developerSummary.number,
      body: updatedBody,
    });

    console.log(
      `Updated progress for ${developerUsername}: ${completionRate}% complete`
    );

    // If onboarding is complete, create a celebration issue
    if (completionRate >= 100) {
      const celebrationIssue = await octokit.rest.issues.create({
        owner,
        repo,
        title: `🎉 Onboarding Complete: @${developerUsername}`,
        body: `## 🎉 Congratulations @${developerUsername}!

You've successfully completed the MortgageMatch Pro onboarding process! Welcome to the team!

### 🏆 Achievements:
- ✅ Environment setup completed
- ✅ Codebase understanding achieved
- ✅ First contribution made
- ✅ AI agent framework learned
- ✅ Onboarding survey completed

### 🚀 What's Next:
- [ ] Join the team standup
- [ ] Start working on real features
- [ ] Continue learning and growing
- [ ] Help other new developers

### 🎯 Your Role:
You're now a full member of the development team! You can:
- Work on feature development
- Review pull requests
- Participate in technical discussions
- Mentor future new developers

### 📚 Resources:
- [Team Handbook](docs/team-handbook.md)
- [Development Workflow](docs/development-workflow.md)
- [Code Review Guidelines](docs/code-review.md)
- [Career Development](docs/career-development.md)

### 🎊 Welcome to the Team!
We're excited to have you on board. Let's build amazing things together!

**Next Steps:**
1. Join the team Slack channels
2. Attend the next team standup
3. Pick up your first feature task
4. Start contributing to the codebase

Congratulations again! 🚀🎉`,
        labels: ["onboarding-complete", "celebration"],
        assignees: [developerUsername],
      });

      console.log(
        `Created celebration issue: ${celebrationIssue.data.title} (#${celebrationIssue.data.number})`
      );
    }
  } catch (error) {
    console.error("Error updating onboarding progress:", error);
    process.exit(1);
  }
}

// Run the script
updateOnboardingProgress();
