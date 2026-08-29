import { analyzeSourceCode } from './src/app/api/_services/ast.service';

async function runTests() {
  const cppWithRecursion = `
    #include <iostream>
    int factorial(int n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    }
    int main() { return 0; }
  `;

  const cppWithLoop = `
    #include <iostream>
    int main() {
      for(int i=0; i<10; i++) {}
      return 0;
    }
  `;

  const jsWithRecursion = `
    function fib(n) {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    }
  `;

  console.log("=== Testing C++ Recursion ===");
  const cppRes1 = await analyzeSourceCode(cppWithRecursion, 'cpp');
  console.log(cppRes1);

  console.log("\n=== Testing C++ Loop ===");
  const cppRes2 = await analyzeSourceCode(cppWithLoop, 'cpp');
  console.log(cppRes2);

  console.log("\n=== Testing JS Recursion ===");
  const jsRes = await analyzeSourceCode(jsWithRecursion, 'javascript');
  console.log(jsRes);
}

runTests();
