//
//  SoulCodexApp.swift
//  SoulCodex
//
//  Created by bj90-m1 on 4/24/26.
//

import SwiftUI
import CoreData

@main
struct SoulCodexApp: SwiftUI.App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
