//
//  SoulCodexxApp.swift
//  SoulCodexx
//
//  Created by bj90-m1 on 4/25/26.
//  Copyright © 2026 Bobbysworld. All rights reserved.
//

import SwiftUI
import SwiftData

@main
struct SoulCodexxApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Item.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
