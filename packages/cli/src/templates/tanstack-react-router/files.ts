export default [
  {
    name: "about.lazy.tsx",
    dir: "src/pages",
    code: `import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/about')({
  component: About,
})

function About() {
  return <div className="p-2">Hello from About!</div>
}
`,
  },
  {
    name: "index.lazy.tsx",
    dir: "src/pages",
    code: `import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
  `,
  },
];
