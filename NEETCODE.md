# 2026-06-16

# Group Anagrams (Neetcode #4, Arrays & Hashing)

## Signal

- Group items that are the same in some kind of way, may require some kind of transformation (sorting, frequency counting, normalization)

- Generalized: any problem where you need to bucket items by certain requirements

- Here: group strings that are equal by character frequency

## Pattern

HashMap<Key, List<Original>>:
1. Compute canonical form (sorted string, frequency array, etc.)
2. Use computeIfAbsent to append to the bucket (in this case: List<String> of anagrams)
3. Return list of all values

## Code Template
Map<String, List<String>> map = new HashMap<>();
for (item : items) {
    String key = canonicalize(item); //In this case sorted chars
    map.computeIfAbsent(key, k -> new ArrayList<>()).add(item);
}
return new ArrayList<>(map.values());

## Trick
- Use computeIfAbsent - replaces the get/check/put
- For anagram-specific: sorted string is easiest (toCharArray then using Arrays.sort()); frequency array is faster though
- Don't use HashMap as a key, if you want just use frequency array using (new int[26] with char - 'a' indexing)
- Fallback if you blank on computeIfAbsent:
    if (!map.containsKey(key)) map.put(key, new ArrayList<>());
    map.get(key).add(item);

# 2026-06-18

# Encode and Decode Strings (NeetCode #6, Arrays & Hashing)

## Signal

- Encode a list of strings into one string for transport, where the strings mya contain any character (including ones that you choose as a delimiter)

- Generalized: When you need to pack multiple things into one string, where any delimiter you'd pick could appear in the content

## Pattern

- Length-prefix encoding
1. Find length of string
2. StringBuild it into with a symbol at the end
3. StringBuild the string you want to encode

## Code Template (Encode)
StringBuilder encoded = new StringBuilder();
for(String str : strs){
    encoded.append(str.length()).append('#').append(str);
}
return encoded.toString();

## Code Template (Decode)
List<String> result = new ArrayList<>();
int i = 0;
while (i < str.length()) {
    int length = 0;
    while (str.charAt(i) != '#') {
        length = length * 10 + (str.charAt(i) - '0');
        i++;
    }
    i++;  // skip '#'
    result.add(str.substring(i, i + length));
    i += length;
}
return result;

## Trick
- In order to do length-prefix encoding, we have to understand that searching for delimiters is inefficient.

["hello", "wo"rld"]

- If we tried to separate by "'s and ,'s, there would be a lot of conditions that we'd have to consider.
- Rather if we encoded the length of the string then use a symbol to tell us the end of the length we're reading in:
    - We can take in the whole string since we have the length
    - We don't have to worry about delimiters.

- To read in a string as numbers: use char-to-int trick
    - ASCII: length * 10 + (char - '0')

- Use StringBuilder over String concat in loops

# 2026-6-18

# Valid Sudoku

## Signal

- Checking if a 9x9 grid has unique rows, cols, and 3x3 squares independently of each other. 

- Generalized: Validate a grid with multiple independent constraints/checks

## Pattern

- Have a separate tracker for each constraint dimension
1. HashSet as it doesn't take in duplicates (tracks uniqueness)

## Code Template
HashSet<Character>[] rows = new HashSet[9];
HashSet<Character>[] cols = new HashSet[9];
HashSet<Character>[][] squares = new HashSet[3][3];

for (int i = 0; i < 9; i++) {
    rows[i] = new HashSet<>();
    cols[i] = new HashSet<>();
}
for (int r = 0; r < 3; r++)
    for (int c = 0; c < 3; c++)
        squares[r][c] = new HashSet<>();

for (int r = 0; r < board.length; r++) {
    for (int c = 0; c < board[r].length; c++) {
        char val = board[r][c];
        if (val == '.') continue;
        if (!rows[r].add(val) || !cols[c].add(val) || !squares[r/3][c/3].add(val)) {
            return false;
        }
    }
}
return true;

## Trick 
- !set.add(val) does both check+add in 1, basically checks for uniqueness and adds it if not present yet
- Box index from (row,col): using [row/3][col/3]
- Always initialize each HashSet in a HashSet[] (list), they're default to null
- If approach feels muddled mid-implementation, stop and redesign. Restarting (18 min wasted → 9 min clean solution) is faster than patching a broken approach.

# 2026-06-18

# Valid Palindrome

## Signal

- Check a property by comparing elements at symmetrical positions in a sequence (examples: palindromes, sorted-pairs, etc.)

## Pattern

- Two pointers that start from opposite ends and they move towards each other. (Loop while the two pointers don't overlap)

## Code Template

int left = 0;
int right = s.length()-1;
while(left < right){
        char curLeft = Character.toLowerCase(s.charAt(left));
        char curRight = Character.toLowerCase(s.charAt(right));
        if(!Character.isLetterOrDigit(curLeft)){
            left++;
        }
        else if(!Character.isLetterOrDigit(curRight)){
                right--;
        }
        else{
            if(curLeft != curRight){
                return false;
            }
            left++;
            right--;
        }
    }
return true;

## Tricks
- Advance one pointer without moving the other when you need to skip
- Character.isLetterOrDigit() and Character.toLowerCase() for char filtering
- O(1) extra space (no new strings allocated) and O(n) time (single pass).

# 2026-06-20

# Longest Consecutive Sequence

## Signal

- Find the longest streak of consecutive things in unordered data

## Pattern

- Use HashSet in order to have quick lookups
- Start the sequence counting where the streak starts where that object does not have any other object preceding it

## Code Template

class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> numbers = new HashSet<>();
        int longest = 0;

        for(int num : nums){
            numbers.add(num);
        }

        for(int number : numbers){
            int sequence = 1;
            int currentNum = number;
            if(!numbers.contains(number-1)){
                while(numbers.contains(currentNum+1)){
                    sequence++;
                    currentNum++;
                }
                if(sequence > longest){
                longest = sequence;
            }
            }
        }

        return longest;
    }
}


## Trick

- The start-of-sequence check is what makes it approximately O(N) as we're not iterating through every number only the beginning of streaks.

# 2026-06-20

# Two Integer Sum II

## Signal

- Two-sum style question on a sorted array, O(1) space needed

## Pattern

- Two pointers from opposite ends moving inwards adding up to look for target sum.
- If sum > target -> move right inward
- If sum < target -> move left inward

## Code Template

class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0;
        int right = numbers.length-1;

        while(left < right){
            int leftNum = numbers[left];
            int rightNum = numbers[right];
            int sum = leftNum + rightNum;
            if(sum == target){
                return new int[] {left+1, right+1};
            }
            else{
                if(sum > target){
                    right--;
                }
                else{
                    left++;
                }
            }
        }
        return new int[] {left+1, right+1};
    }
}


## Trick

- Sortedness makes this work because you always know which direction to move inward. 
- Without sorted values you have no way to choose which direction

# 2026-06-23

# Container With Most Water

## Signal

- Optimize a value (area, distance, etc.) formed from two values endpoints of an array, where one limiter can only get worse as pointers move inward.

## Pattern

- Two pointers from opposite ends moving inwards looking to find largest area using those heights

## Code Template

class Solution {
    public int maxArea(int[] heights) {
        int left = 0;
        int right = heights.length-1;
        int largest = 0;

        while(left < right){
            int width = right-left;
            int leftHeight = heights[left];
            int rightHeight = heights[right];
            int lowestHeight = Math.min(leftHeight, rightHeight);
            largest = Math.max(largest, lowestHeight * width);
            if(leftHeight < rightHeight){
                left++;
            }
            else{
                right--;
            }

        }

        return largest;
    }
}

## Trick
- Move the limiting pointer inward, never the taller one because width will only get worse going inward
- Also need to use the smallest vertical height

# 2026-06-23

# 3Sum

## Signal

- Find all unique combinations in an array that satisfy some sum/target. Recognize when you need to fix one element and search for the rest in a two-sum pattern

## Pattern

- Sort array first. Outer for-loop finds one element nums[i] to target. Inner two-pointer searches the subarray (i+1, nums.length-1) for the other two values that sum up to -target. The outer loop picks target, inner while loop finds the other two.

## Code Template

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> tripleList = new ArrayList<>();
        Arrays.sort(nums);
        int numsSize = nums.length;
        for(int i = 0; i < numsSize - 2; i++){
            int target = -nums[i];
            if (i > 0 && nums[i] == nums[i-1]) continue;
            int left = i+1;
            int right = numsSize - 1;
            while(left < right){
                if(nums[left] + nums[right] == target){
                    List<Integer> triple = new ArrayList<>();
                    triple.add(nums[i]);     
                    triple.add(nums[left]);
                    triple.add(nums[right]);
                    tripleList.add(triple);
                    left++;
                    right--;
                    while (left < right && nums[left] == nums[left-1]) left++;
                    while (left < right && nums[right] == nums[right+1]) right--;
                }
                else if(nums[left] + nums[right] < target){
                    left++;
                }
                else{
                    right--;
                }
            }
        }
        return tripleList;
    }
}

## Trick

- Advancing both pointers to avoid duplicate numbers
- Need to have the array sorted

## Lesson

- When stuck, don't rewrite working code. Identify what's missing, add it, leave the rest alone.

# 2026-06-25

# Best Time to Buy and Sell Stock

## Signal

- Go through an array and track the min and max, in this case the lowest buy highest sell

## Pattern

- Two pointers move to the right together. Then once the right hits a smaller min, left jumps to the right pointer. Right keeps moving forward. 

## Code Template

class Solution {
    public int maxProfit(int[] prices) {
        int left = 0;
        int right = 0;
        int largestProfit = 0;

        while(right < prices.length){
            int currentLeft = prices[left];
            int currentRight = prices[right];
            if(currentRight < currentLeft){
                left = right;
            }
            else{
                largestProfit = Math.max(largestProfit, currentRight - currentLeft);
            }

            right++;
        }

        return largestProfit;
    }
}

## Trick

- Left jumps to the right pointer, does not slide with it
- O(N) since we don't always check every buy against every sell. Only checks our current min to the values to the right

# Longest Substring Without Repeating Characters

## Signal

- Find the longest/shortest sequence within an array or string that satisfies a property. 

## Pattern

- Outer loop / right side of window keeps advancing forward making the window bigger
- Inner loop / left side of window contracts whenever we violate the proper
- Record the state of our window every iteration

## Code Template

class Solution {
    public int lengthOfLongestSubstring(String s) {
        int left = 0;
        int right = 0;
        int longest = 0;
        Set<Character> charSet = new HashSet<>();

        while(right < s.length()){
            if(!charSet.add(s.charAt(right))){
                while(charSet.contains(s.charAt(right))){
                    charSet.remove(s.charAt(left));
                    left++;
                }
            }
            
            charSet.add(s.charAt(right));
            longest = Math.max(longest, right - left + 1);
            right++;
        }

        return longest;
    }
}

## Trick
- Left slides forward (compared to two pointer which jumps) like a window
- HashSet tracks what's in the window, O(1) lookups
- Record the longest version unconditionally after each window expansion
- Buy/Sell Stock: left jumps to right when a new min appears. This problem: left slides forward (sometimes multiple positions) to remove a duplicate. Both are sliding window, mechanically different.

# 2026-06-30

# Longest Repeating Character Replacement

## Signal

- Find the biggest/smallest sequence within an array/string that matches a criteria

## Pattern

- Variable-sized window with a invariant limit of k

## Code Template 

class Solution {
    public int characterReplacement(String s, int k) {
        int mostFreq = 0;
        int longest = 0;
        int left = 0;
        int right = 0;
        int[] charFreq = new int[26];

        while(right < s.length()){
            charFreq[s.charAt(right) - 'A']++;
            mostFreq = Math.max(mostFreq, charFreq[s.charAt(right) - 'A']);
            while((right - left + 1) - mostFreq > k){
                charFreq[s.charAt(left) - 'A']--;
                left++;
            }
            longest = Math.max(longest, right - left + 1);
            right++;
        }

        return longest;
    }
}


## Trick

- You don't decrease maxCount this is because it's monotonically non-decreasing
- Need to internalize this, I'm not sure of this yet 
- Compared to Longest Substring: that one's invariant is 'no repeats.' This one's invariant is 'can be made uniform with ≤k replacements.' Different invariants, same variable-window pattern.

# 2026-07-02

# Permutation in String

## Signal

- Check if a substring/subarray with a known fixed size window matches some kind of criteria, at any position. 

## Pattern

- Fixed window size, should be moving left and right pointers at the same time keeping the same size.
- Every time you should add the right remove the left
- Don't need left variable can just figure out by doing right - fixedSize

## Code Template 

class Solution {
    public boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;


        int[] s1Freq = new int[26];
        int[] s2Freq = new int[26];
 
        for(int i = 0; i < s1.length(); i++){
            s1Freq[s1.charAt(i) - 'a']++;
            s2Freq[s2.charAt(i) - 'a']++;
        }

        if(Arrays.equals(s2Freq, s1Freq)){
            return true;
        }


        for(int right = s1.length(); right < s2.length(); right++){
            s2Freq[s2.charAt(right) - 'a']++;
            s2Freq[s2.charAt(right - s1.length()) - 'a']--;
            if(Arrays.equals(s2Freq, s1Freq)){
                return true;
            }
        }

        return false;
    }
}

## Trick

- Compared to variable size: You don't expand right and contract the left once you hit an invalid variant
- In fixed-size: You should be doing symmetric movements and expand right then contract left.

- If problem specifies window size: fixed
- Asked you to find the window size: variable

- Arrays.equals(a, b) for content comparison 