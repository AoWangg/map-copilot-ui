import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bus,
  Map,
  Brain,
  BarChart3,
  Route,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Globe,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TransportX</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/bus-lines">
              <Button variant="ghost">公交线路查询</Button>
            </Link>
            <Link href="/line-evaluation">
              <Button variant="ghost">线路评估分析</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold text-gray-900">大语言模型智能体驱动的</h1>
          </div>
          <h1 className="text-5xl font-bold text-blue-600 mb-6">
            公交线网评估平台
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            基于大语言模型的智能分析系统，为城市公交线网提供数据驱动的评估与优化建议
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bus-lines">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                开始探索线路
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/line-evaluation">
              <Button size="lg" variant="outline">
                查看评估报告
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            平台核心功能
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            结合人工智能与地理信息系统，为公交线网提供全方位的智能分析
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>AI智能分析</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                基于大语言模型的智能分析引擎，自动识别线路优化机会
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Map className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>可视化地图</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                交互式地图界面，直观展示线路分布和评估结果
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>数据驱动决策</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                基于实时数据的科学评估，支持精准的线路优化决策
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Navigation Cards */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            选择您的功能
          </h2>
          <p className="text-lg text-gray-600">
            探索公交线路或进行深度评估分析
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/bus-lines">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Route className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-blue-600">
                  公交线路探索
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base mb-4">
                  浏览城市公交线路网络，查看线路详情和实时信息
                </CardDescription>
                <div className="flex items-center justify-center text-blue-600 font-medium">
                  开始探索
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/line-evaluation">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  线路评估分析
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base mb-4">
                  使用AI智能分析工具，评估线路效率并提出优化建议
                </CardDescription>
                <div className="flex items-center justify-center text-green-600 font-medium">
                  开始评估
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">100+</span>
              </div>
              <p className="text-gray-600">覆盖城市</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Route className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">1000+</span>
              </div>
              <p className="text-gray-600">分析线路</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-purple-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">50K+</span>
              </div>
              <p className="text-gray-600">服务用户</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">
          © 2024 Map Copilot. 智能体驱动的公交线网评估平台
        </p>
      </footer> */}
    </div>
  );
}
