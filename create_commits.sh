#!/bin/bash

# Script to create 100 commits for no reason (as requested!)

# Array of fun commit types
types=("feat" "fix" "docs" "style" "refactor" "test" "chore" "perf" "ci" "build")

# Array of fun feature descriptions
features=(
    "improve error handling"
    "optimize performance"
    "enhance user experience"
    "add logging capabilities"
    "refactor code structure"
    "update documentation"
    "fix minor bugs"
    "add unit tests"
    "improve code coverage"
    "enhance security"
    "optimize memory usage"
    "improve accessibility"
    "add type definitions"
    "enhance API responses"
    "optimize database queries"
    "improve caching"
    "add validation"
    "enhance monitoring"
    "improve scalability"
    "add metrics collection"
    "optimize load times"
    "enhance debugging"
    "improve error messages"
    "add retry logic"
    "enhance configuration"
    "optimize network requests"
    "improve code readability"
    "add feature flags"
    "enhance testing framework"
    "optimize build process"
    "improve deployment"
    "add health checks"
    "enhance observability"
    "optimize resource usage"
    "improve documentation"
    "add examples"
    "enhance CLI interface"
    "optimize parsing logic"
    "improve data validation"
    "add benchmark tests"
    "enhance error recovery"
    "optimize concurrent processing"
    "improve rate limiting"
    "add progress indicators"
    "enhance timeout handling"
    "optimize cookie management"
    "improve request headers"
    "add session management"
    "enhance proxy support"
    "optimize screenshot capture"
)

# Array of components
components=(
    "scraper engine"
    "data parser"
    "CSV exporter"
    "error handler"
    "rate limiter"
    "config loader"
    "utils module"
    "demo framework"
    "test suite"
    "CLI interface"
    "browser manager"
    "selector engine"
    "wait conditions"
    "retry mechanism"
    "logging system"
    "validation logic"
    "export manager"
    "stealth features"
    "bot detection"
    "navigation logic"
)

echo "🚀 Creating 100 commits for no reason..."

for i in {1..100}; do
    # Pick random elements
    type_index=$((RANDOM % ${#types[@]}))
    feature_index=$((RANDOM % ${#features[@]}))
    component_index=$((RANDOM % ${#components[@]}))
    
    type=${types[$type_index]}
    feature=${features[$feature_index]}
    component=${components[$component_index]}
    
    # Create a small change to keep Git happy
    echo "// Commit #$i: $type - $feature in $component" >> .temp_commit_$i.txt
    
    # Stage the change
    git add .temp_commit_$i.txt
    
    # Create commit with fun message
    git commit -m "$type: $feature in $component (#$i)

- This is commit number $i out of 100
- Component: $component
- Change type: $type
- Description: $feature
- Timestamp: $(date)"
    
    echo "✅ Created commit $i/100"
    
    # Small delay to make timestamps different
    sleep 0.1
done

echo "🎉 All 100 commits created successfully!"
echo "📊 Total commits in this branch:"
git rev-list --count mvp1
