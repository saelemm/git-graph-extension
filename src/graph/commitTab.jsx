export default function Component(commits) {
    const [selectedBranch, setSelectedBranch] = useState("main")
  
    return (
      <div className="bg-gray-900 text-white min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Branch Selection Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Commits</h1>
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-gray-400" />
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {branches.map((branch) => (
                      <SelectItem
                        key={branch.name}
                        value={branch.name}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{branch.name}</span>
                          <span className="text-gray-400 text-sm ml-2">{branch.commitCount} commits</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Showing commits from <span className="text-blue-400 font-mono">{selectedBranch}</span>
            </div>
          </div>
  
          {/* Commits List */}
          <div className="space-y-0 bg-gray-800 rounded-lg border border-gray-700">
            {commits.map((commit) => (
              <div
                key={commit.id}
                className="flex items-center justify-between py-3 px-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/placeholder.svg?height=24&width=24"
                      alt={commit.author}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium truncate">{commit.message}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-400 text-sm">{commit.author}</span>
                      <span className="text-gray-500 text-sm">{commit.timestamp}</span>
                      {commit.verified && <Check className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                </div>
  
                <div className="flex items-center space-x-2 ml-4">
                  <div className="bg-gray-700 px-3 py-1 rounded text-sm font-mono text-blue-400">{commit.hash}</div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-600">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-600">
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }