<picture>
<source srcset="public/images/Banner-dark.png" media="(prefers-color-scheme: dark)">
<img src="public/images/Banner-light.png" alt="Banner" width="400">
</picture>

An app to scrape Instagram business accounts, classify posts, retrieve insights and more.

## How to use it?
- Go to the dashboard to create a new scope
- Add the accounts you want to scrape
- Edit the classification categories if required
- Choose the maximum number of posts to scrape from each account
- Click run and wait for the task to finish

## What does it do?
- The app scrapes multiple posts from the selected accounts
- Collects data like posting time, date, no of likes, comments, etc
- Classifies the post using an LLM into the given categories based on `Intent` and `Format`
- Analyses raw data to provide info about how each category performs on average, posting times and more

## Reading the 'Extracted Data'
- Bar graphs for both the `Intent` and `Format` classifications show the average performance of each type of post across all accounts, relative to the average likes for that account. <br>
  `
    eg, If posts under the 'Educational' category receive on average 200 likes, while the average likes across all posts is 500, its relative performance is -60%
  `
- Doughnut charts above each category show the 'Win Rate' (% of accounts that received a positive lift in likes for those kinds of posts)
- Individual account insights for all the scraped accounts are available in the same format
- Top performer insights give an idea of the required frequency of posting
- 'Content Type Performance' gives the relative performance of reels over posts
- Overview of posting windows that got the most interaction 
