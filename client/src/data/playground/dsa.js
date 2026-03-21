export const dsaPlayground = {
  title: "Data Structures & Algorithms",
  subtitle: "Master algorithmic problem solving for technical interviews",
  chapters: [
    {
      id: "arrays-and-hashing",
      title: "Arrays & Hashing",
      description:
        "Fundamental techniques for manipulating arrays and using hash maps for O(1) lookups.",
      totalXp: 200,
      problems: [
        {
          id: "two-sum",
          title: "Two Sum",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.\n\nNotes:\n- You may assume that each input would have exactly one solution, and you may not use the same element twice.\n- You can return the answer in any order.",
          hints: [
            "A brute force solution takes O(n^2). Can we do better?",
            "Try using a hash map to store the elements you have seen so far to achieve O(n) time.",
          ],
          examples: [
            {
              input: "nums = [2,7,11,15], target = 9",
              output: "[0,1]",
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
            { input: "nums = [3,3], target = 6", output: "[0,1]" },
          ],
          constraints: [
            "2 ≤ nums.length ≤ 10⁴",
            "-10⁹ ≤ nums[i] ≤ 10⁹",
            "-10⁹ ≤ target ≤ 10⁹",
            "Only one valid answer exists",
          ],
          starterCode: {
            javascript:
              "function twoSum(nums, target) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]\nconsole.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]\nconsole.log(twoSum([3, 3], 6)); // Expected: [0, 1]",
            python:
              "def twoSum(nums, target):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(twoSum([2, 7, 11, 15], 9))  # Expected: [0, 1]\nprint(twoSum([3, 2, 4], 6))  # Expected: [1, 2]\nprint(twoSum([3, 3], 6))  # Expected: [0, 1]",
            java: "import java.util.*;\n\nclass Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n        return new int[0];\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // Expected: [0, 1]\n        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6))); // Expected: [1, 2]\n        System.out.println(Arrays.toString(twoSum(new int[]{3, 3}, 6))); // Expected: [0, 1]\n    }\n}",
          },
          expectedOutput: {
            javascript: "[ 0, 1 ]\n[ 1, 2 ]\n[ 0, 1 ]",
            python: "[0, 1]\n[1, 2]\n[0, 1]",
            java: "[0, 1]\n[1, 2]\n[0, 1]",
          },
        },
        {
          id: "maximum-subarray",
          title: "Maximum Subarray",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description:
            "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
          hints: [
            "Try Kadane's Algorithm to solve this in O(n) time and O(1) space.",
          ],
          examples: [
            {
              input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
              output: "6",
              explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
            },
            {
              input: "nums = [1]",
              output: "1",
              explanation: "The subarray [1] has the largest sum 1.",
            },
          ],
          constraints: ["1 ≤ nums.length ≤ 10⁵"],
          starterCode: {
            javascript:
              "function maxSubArray(nums) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6\nconsole.log(maxSubArray([1])); // Expected: 1",
            python:
              "def maxSubArray(nums):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6\nprint(maxSubArray([1]))  # Expected: 1",
            java: "class Solution {\n    public static int maxSubArray(int[] nums) {\n        // Write your solution here\n        \n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})); // Expected: 6\n        System.out.println(maxSubArray(new int[]{1})); // Expected: 1\n    }\n}",
          },
          expectedOutput: {
            javascript: "6\n1",
            python: "6\n1",
            java: "6\n1",
          },
        },
      ],
    },
    {
      id: "two-pointers-and-strings",
      title: "Strings & Two Pointers",
      description:
        "Solve problems efficiently by using left and right indices iterating towards each other.",
      totalXp: 300,
      problems: [
        {
          id: "reverse-string",
          title: "Reverse String",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "Write a function that reverses a string. The input string is given as an array of characters s.\n\nNotes:\n- You must do this by modifying the input array in-place with O(1) extra memory.",
          hints: [
            "Use two pointers, one at the start and one at the end, and swap the characters as they approach the middle.",
          ],
          examples: [
            {
              input: 's = ["h","e","l","l","o"]',
              output: '["o","l","l","e","h"]',
            },
          ],
          starterCode: {
            javascript:
              'function reverseString(s) {\n  // Write your solution here\n  \n}\n\n// Test cases\nlet test1 = ["h","e","l","l","o"];\nreverseString(test1);\nconsole.log(test1); // Expected: ["o","l","l","e","h"]',
            python:
              'def reverseString(s):\n    # Write your solution here\n    pass\n\n# Test cases\ntest1 = ["h","e","l","l","o"]\nreverseString(test1)\nprint(test1)  # Expected: ["o","l","l","e","h"]',
            java: "import java.util.*;\n\nclass Solution {\n    public static void reverseString(char[] s) {\n        // Write your solution here\n        \n    }\n    \n    public static void main(String[] args) {\n        char[] test1 = {'h','e','l','l','o'};\n        reverseString(test1);\n        System.out.println(Arrays.toString(test1)); // Expected: [o, l, l, e, h]\n    }\n}",
          },
          expectedOutput: {
            javascript: "[ 'o', 'l', 'l', 'e', 'h' ]",
            python: "['o', 'l', 'l', 'e', 'h']",
            java: "[o, l, l, e, h]",
          },
        },
        {
          id: "valid-palindrome",
          title: "Valid Palindrome",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
          hints: [
            "You can either clean the string first or skip non-alphanumeric characters inline using two pointers.",
          ],
          examples: [
            {
              input: 's = "A man, a plan, a canal: Panama"',
              output: "true",
              explanation: '"amanaplanacanalpanama" is a palindrome.',
            },
          ],
          starterCode: {
            javascript:
              'function isPalindrome(s) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(isPalindrome("A man, a plan, a canal: Panama")); // Expected: true',
            python:
              'def isPalindrome(s):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(isPalindrome("A man, a plan, a canal: Panama"))  # Expected: True',
            java: 'class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your solution here\n        \n        return false;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // Expected: true\n    }\n}',
          },
          expectedOutput: {
            javascript: "true",
            python: "True",
            java: "true",
          },
        },
        {
          id: "container-with-most-water",
          title: "Container With Most Water",
          difficulty: "Medium",
          xp: 100,
          isCompleted: false,
          description:
            "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\nReturns the maximum amount of water a container can store.",
          hints: [
            "Start with maximum width (pointers at 0 and n-1) and greedily move the pointer that points to the shorter line.",
          ],
          examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" }],
          starterCode: {
            javascript:
              "function maxArea(height) {\n  // Write your solution here\n  \n}\n\n// Test cases\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7])); // Expected: 49",
            python:
              "def maxArea(height):\n    # Write your solution here\n    pass\n\n# Test cases\nprint(maxArea([1,8,6,2,5,4,8,3,7]))  # Expected: 49",
            java: "class Solution {\n    public static int maxArea(int[] height) {\n        // Write your solution here\n        \n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7})); // Expected: 49\n    }\n}",
          },
          expectedOutput: {
            javascript: "49",
            python: "49",
            java: "49",
          },
        },
      ],
    },
    {
      id: "linked-lists",
      title: "Linked Lists",
      description:
        "Understand node traversal, pointer manipulation, and cycle detection.",
      totalXp: 300,
      problems: [
        {
          id: "reverse-linked-list",
          title: "Reverse Linked List",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "Given the head of a singly linked list, reverse the list, and return the reversed list.",
          hints: [
            "You can do this iteratively by changing the next pointer to point to the previous node.",
          ],
          examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }],
          starterCode: {
            javascript:
              "function reverseList(head) {\n  // Write your solution here\n}",
            python:
              "def reverseList(head):\n    # Write your solution here\n    pass",
            java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}",
          },
          expectedOutput: {
            javascript: "[5, 4, 3, 2, 1]",
            python: "[5, 4, 3, 2, 1]",
            java: "[5, 4, 3, 2, 1]",
          },
        },
        {
          id: "merge-two-sorted-lists",
          title: "Merge Two Sorted Lists",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "You are given the heads of two sorted linked lists list1 and list2.\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.",
          hints: [
            "Use a dummy head to simplify edge cases and iteratively attach the smaller node.",
          ],
          examples: [
            {
              input: "list1 = [1,2,4], list2 = [1,3,4]",
              output: "[1,1,2,3,4,4]",
            },
          ],
          starterCode: {
            javascript:
              "function mergeTwoLists(list1, list2) {\n  // Write your solution here\n}",
            python:
              "def mergeTwoLists(list1, list2):\n    # Write your solution here\n    pass",
            java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your solution here\n        return null;\n    }\n}",
          },
          expectedOutput: {
            javascript: "[1, 1, 2, 3, 4, 4]",
            python: "[1, 1, 2, 3, 4, 4]",
            java: "[1, 1, 2, 3, 4, 4]",
          },
        },
      ],
    },
    {
      id: "binary-trees",
      title: "Binary Trees",
      description:
        "Learn recursive tree traversal, depth-first search, and breadth-first search logic.",
      totalXp: 300,
      problems: [
        {
          id: "invert-binary-tree",
          title: "Invert Binary Tree",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "Given the root of a binary tree, invert the tree, and return its root.",
          hints: [
            "Use recursion. Swap the left and right children for every node.",
          ],
          examples: [
            { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
          ],
          starterCode: {
            javascript:
              "function invertTree(root) {\n  // Write your solution here\n}",
            python:
              "def invertTree(root):\n    # Write your solution here\n    pass",
            java: "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your solution here\n        return null;\n    }\n}",
          },
          expectedOutput: {
            javascript: "[4, 7, 2, 9, 6, 3, 1]",
            python: "[4, 7, 2, 9, 6, 3, 1]",
            java: "[4, 7, 2, 9, 6, 3, 1]",
          },
        },
        {
          id: "maximum-depth-of-binary-tree",
          title: "Maximum Depth of Binary Tree",
          difficulty: "Easy",
          xp: 100,
          isCompleted: false,
          description:
            "Given the root of a binary tree, return its maximum depth.\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
          hints: [
            "Use recursion. The depth is 1 + the max of the depths of the left and right subtrees.",
          ],
          examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "3" }],
          starterCode: {
            javascript:
              "function maxDepth(root) {\n  // Write your solution here\n}",
            python:
              "def maxDepth(root):\n    # Write your solution here\n    pass",
            java: "class Solution {\n    public int maxDepth(TreeNode root) {\n        // Write your solution here\n        return 0;\n    }\n}",
          },
          expectedOutput: {
            javascript: "3",
            python: "3",
            java: "3",
          },
        },
      ],
    },
    {
      id: "advanced-algorithms",
      title: "Advanced Algorithms",
      description:
        "Hard tier problems combining multiple data structures like Heaps, Graphs, and binary searching.",
      totalXp: 300,
      problems: [
        {
          id: "median-of-two-sorted-arrays",
          title: "Median of Two Sorted Arrays",
          difficulty: "Hard",
          xp: 150,
          isCompleted: false,
          description:
            "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
          hints: [
            "Use binary search. You don't need to merge the arrays to find the median.",
          ],
          examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.0" }],
          starterCode: {
            javascript:
              "function findMedianSortedArrays(nums1, nums2) {\n  // Write your solution here\n}",
            python:
              "def findMedianSortedArrays(nums1, nums2):\n    # Write your solution here\n    pass",
            java: "class Solution {\n    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your solution here\n        return 0.0;\n    }\n}",
          },
          expectedOutput: {
            javascript: "2.0",
            python: "2.0",
            java: "2.0",
          },
        },
        {
          id: "trapping-rain-water",
          title: "Trapping Rain Water",
          difficulty: "Hard",
          xp: 150,
          isCompleted: false,
          description:
            "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.\n\nNotes:\n- Water is trapped between higher bars.",
          hints: [
            "You can use two pointers, dynamic programming, or a monotonic decreasing stack.",
          ],
          examples: [
            { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
          ],
          starterCode: {
            javascript:
              "function trap(height) {\n  // Write your solution here\n}",
            python:
              "def trap(height):\n    # Write your solution here\n    pass",
            java: "class Solution {\n    public static int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}",
          },
          expectedOutput: {
            javascript: "6",
            python: "6",
            java: "6",
          },
        },
      ],
    },
  ],
};
