---
title: "Does your code match your spec?"
sourceUrl: "https://kiro.dev/blog/property-based-testing/"
category: "blog"
lastUpdated: "2026-02-07T05:52:40.381Z"
---
## The importance of specification

Kiro is an agentic IDE that introduced Spec Driven Development (SDD) when it launched in July. With SDD, Kiro’s agent writes a full specification of your software before writing any code. This allows you to iterate with the agent and check that you have fully captured your application’s requirements before you develop it. Kiro then translates your requirements document into an “executable specification” that it then uses to check if the generated code adheres to the specification. Kiro uses these executable specifications to test your program, using a technique called property-based testing, which we believe is more effective at finding bugs.

## From requirements to properties

When using Kiro, it will generate some code starting from a spec. How do we know the code really does what the spec says it should do? Kiro and other GenAI code generation tools have been using automatically generated unit tests to help answer this question. Kiro generates unit tests along with the code, and makes sure the code passes them. But there is a chicken-and-egg problem. How do we know the unit tests capture the behavior given in the specification? We need to look at each test and figure out 1/ which specification requirement(s) the test may apply to, and 2/ whether the prescribed behavior in the test matches the specification. Both steps can be tedious and error prone.

As it turns out, we can do better in some cases by using *property*-based tests, rather than unit tests. Unit tests are essentially “example-based” tests, comprised of single input/output pairs. Each one asserts that on a specific example, your system behaves a certain way. In contrast, a property-based test (or simply, *property test*) tests that *property* is true of the system’s behavior, which is to say that it holds for a large (potentially infinite) range of inputs. It’s this universality that gives property tests their power. Given some property tests, we randomly generate many inputs in order to test them. If the property test ever returns false, we’ve found a counter-example that breaks the property. This likely represents a bug in the program under test (but it could also be a bug in property definition, or in the original specification, which is also useful to find). Kiro can use this example to fix the code until it gets it right.

Property-based testing was invented more than two decades ago for the Haskell programming language in a framework called QuickCheck. It has grown and matured over time. Property tests are a great match for specification-driven development, as done by Kiro, because specification requirements are oftentimes directly expressing properties, and these properties can be tested using property-based tests. In a sense, properties are another representation of (parts of) your specification. With property-based tests, we have an “executable specification” — in other words: a version of the specification that we can run. The executable specification comprising of property-based tests is easily linked to the textual requirements, thus giving us confidence that as long as the property tests pass, our code is doing what the requirements say that it should.

### Example

As an example, let’s imagine we’re writing a small traffic light simulator in Python. Kiro will create a specification with a Requirements document comprised of Acceptance Criteria. One of the Acceptance Criteria might look like this:

This criterion is expressing an important condition for a traffic light: that *no two directions are ever green at the same time.* Here’s this Acceptance Criterion transformed into a textual property.

Notice that this property starts with the words “for any”. This is a property because it is talking about a range of inputs and behaviors, not a description of how a single example input should be processed. Kiro takes this property text and reifies it into a property-based test, i.e., an *executable specification*. Kiro connects the two, by letting us navigate directly from our textual specification to the test that checks this property.

Kiro translates textual properties into property-based tests written using a framework called [Hypothesis](https://hypothesis.readthedocs.io/en/latest/), which we see more about later. The code for our traffic light property is given below. We can read this code and see that it does in fact check the property we care about. It first checks that we are starting in a nominal state. Then it iterates through each operation in the schedule of operations, applies them, and checks that we only ever see one green light.

The thing that is great about this property test is that it directly tests the requirement we started from. This means that if we use sufficiently many inputs, we get confidence that the requirement is satisfied. More importantly, the corollary also holds: The program is *incorrect *if there exists an input that causes this function to fail. Kiro will make great use of this fact.

A key part of property testing to randomly generate a diverse range of inputs with which to execute a property test. In our example, the key input is the `list` of operations passed to `test_safety_invariant_at_most_one_green`. We will discuss input generation in the context of this example in the next section. Automated input generation provides a key advantage over unit testing. Whenever someone writes unit tests (whether a model or a human) they will try to account for edge cases,** but they are limited by their own internal biases**. By utilizing random generation, we can often uncover edge cases and interactions between components that are often missed.

### Shapes of properties

The program correctness literature finds that there are common “shapes” of properties that tend to show up. Kiro is aware of these shapes, and looks for them when generating properties. For instance, a common property of data structures, like binary search trees, is that they maintain some runtime invariant. We can write a property to validate that individual operations maintain the invariant.

Another common property shape is the “round trip”, in which some sequence of operations gets you back the value you started with. This property is especially useful for parsers and serializers.

Oftentimes for web APIs, we want delete operations to be "idempotent", meaning that repeating an action twice has the same effect as doing it once.

For more information on designing properties yourself, we’d recommend the following blog post: [Choosing Properties for Property-Based Testing](https://fsharpforfunandprofit.com/posts/property-based-testing-2/), and the [How To Specify it](https://research.chalmers.se/publication/517894/file/517894_Fulltext.pdf) [PDF] papers.

## Testing properties with input generators

In order to test properties, we need concrete input values. In order to get many (hundreds) of diverse values, and reduce the impact of bias, PBT frameworks use “generators” which are functions that take some kind of randomness and produce input values of a specific type. Users of property-based testing frameworks specify which input generators to use when executing particular property tests. Kiro does that for us for the property tests it generates.

PBT frameworks such as Hypothesis ship with a bunch of generators for common types that you can use as building blocks to create more complex generators. The Hypothesis framework calls its generators *strategies*, and often stores strategies in the variable `st`. Here are some example strategies for generating integers.

Hypothesis also ships with more complicated strategies for bespoke datatypes.

We can build up complicated strategies from smaller ones, too. For example, the `lists` strategy takes another strategy as an argument, building lists of things generated by that argument.

## Property-based testing in Kiro

As of today, Kiro will write property-based tests for you, both the property checking code and the generators, in order to test your requirements. Returning to our traffic light example from earlier, Kiro not only generates the property checking code we saw earlier, it adds the `@given` annotations on top of the method, listing the two Hypothesis strategies that we want to use.

Here is the strategy that Kiro wrote for our property. This code uses the Hypothesis strategy framework to build up a strategy over sequences of traffic light transitions. We can see the strategy referencing other strategies that Kiro has written, such as `signal_state_strategy`, allowing for code sharing between multiple property tests.

This test integrates out of the box with pytest, the standard Python testing framework. When `pytest` is executed, Hypothesis will generate 100 test cases, and make sure all of them pass the property.

It’s important for testing quality that input generation strategies indeed produce a variety of inputs. We can assess how well we are doing by examining those inputs, and the code covered when running them, using a tool called [Tyche](https://github.com/tyche-pbt/tyche-extension). Here are some samples of the inputs that the generator came up with, which Tyche shows us:

Here is a visualization Tyche produces to show code being executed by our property-based test. You can see that even after 50 trials, we’re still exploring new code paths.

A word of caution about code coverage: While it is an extremely common metric for measuring test suite effectiveness, is not the ultimate arbiter of test quality. Covering (i.e., executing) a line of code does not mean we’ve exhausted all the behavior on that line. Property testing can’t guarantee your program is absent of bugs, as it’s not an exhaustive technique. There could always be a counterexample that property-based testing fails to find. However, we believe that property-based testing is a more effective tool than traditional example-based testing at finding bugs, does a better job at tying your specifications and tests together, and takes the critical step of phrasing the program correctness problem in terms of concrete, executable specifications.

## Counterexamples and shrinking

Before we finish up this post, we want to talk about one final feature of property-based testing that is really helpful: *shrinking*. When a property test fails, you get an input that causes the property to fail, i.e. a counterexample. Ideally, you would like a *minimal* input, some small example that demonstrates the core of the problem that made the test fail. A giant counterexample likely contains extraneous data that has nothing to do with the problem, whereas a minimal example helps you (and likely the Kiro agent) identify the actual fault in the program, and repair it. Most property-based testing frameworks attempt to give you a minimal example through a process called “shrinking”. Let’s see how this works.

Imagine we’re implementing a set backed by a Search Tree. We would likely have the following property:

Running this test, we might get an output like:

But this wasn’t in fact the first falsifying example that Hypothesis found. Looking at Hypothesis logs, the first failing counterexample was actually the following:

This would be a more annoying case to debug! **Shrinking systematically simplifies the failing input while checking it still triggers the failure.** In our example, Hypothesis removed unnecessary nodes, reduced integer values, and simplified the tree structure until it found the minimal case: two single-node trees both containing the value 0. This reveals the core issue—the union operation doesn't properly handle duplicate values—without the noise of a complex tree structure.

When Kiro generates property tests, it leverages the shrinking capabilities of the underlying PBT framework. This means that when a property test fails during development, you get an actionable, minimal counterexample that makes debugging significantly easier. The agent can use this minimal example to more easily understand the root cause and propose a fix, creating a tight feedback loop between specification, testing, and implementation. When Kiro finds that the implementation might be correct but it disagrees with the specification, or if the AI generated code looks fundamentally wrong in a non-trivial way, Kiro will surface this to the developer to make a choice: fix the code, fix the spec, or fix the PBT. Doing so combines human judgement with AI and PBTs to more clearly align the implementation to developer intent.

## Conclusion

Kiro’s inclusion of property-based testing is a shift in how we think about correctness with AI coding tasks, moving from checking individual examples to validating universal properties across entire input spaces. By automatically translating natural language specifications into executable properties and generating comprehensive test cases, Kiro creates a powerful feedback loop that helps both AI agents and human developers build more reliable software. This approach not only finds bugs that traditional testing misses, but also maintains a clear, traceable link between requirements and the tests that validate them. While PBT cannot guarantee the absence of all bugs, it provides significantly stronger evidence of correctness than example-based testing alone, making it an essential tool for specification-driven development.

For more information on LLMs and property-based testing please see the following research papers:

- QuickCheck
- Can LLMs write good PBTs
- Agentic PBT
- Use Property-Based Testing to Bridge LLM Code Generation and Validation
- Tyche [PDF]

[Download Kiro](/downloads/), and try [property-based testing](/docs/specs/correctness/) with [specs](/docs/specs/).